const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

// 永続化ファイル
const DATA_FILE = path.join(__dirname, 'inactivityData.json');

// 監視対象のチャンネルID（必要に応じて追加してください）
const monitoredChannels = [
    'CHANNEL_ID_1',  // 例：雑談チャンネルID1
    'CHANNEL_ID_2',  // 例：雑談チャンネルID2
];

// 各通知間隔（ミリ秒）
const intervals = {
    '15m': 15 * 60 * 1000,
    '30m': 30 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '3h': 3 * 60 * 60 * 1000,
};

// カスタム通知メッセージ（変更可能）
let customMessages = {
    '15m': '15分間、雑談チャンネルにShibakenBOT以外のメッセージがありません。',
    '30m': '30分間、雑談チャンネルにShibakenBOT以外のメッセージがありません。',
    '1h': '1時間、雑談チャンネルにShibakenBOT以外のメッセージがありません。',
    '3h': '3時間、雑談チャンネルにShibakenBOT以外のメッセージがありません。'
};

// 通知済みかどうかの状態をチャンネルごとに保持
// { [channelId]: { lastActivity: number, timers: { [intervalKey]: Timeout }, sent: { [intervalKey]: boolean } } }
let channelStatus = {};

// 読み込み/保存関数
function loadData() {
    if (fs.existsSync(DATA_FILE)) {
        try {
            channelStatus = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        } catch (e) {
            console.error('inactivityData.json parse error:', e);
            channelStatus = {};
        }
    }
}
function saveData() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(channelStatus, null, 2));
}

// タイマー設定用関数
async function scheduleTimers(client, channelId) {
    if (!channelStatus[channelId]) return;
    // まず全タイマークリア
    if (channelStatus[channelId].timers) {
        for (const key in channelStatus[channelId].timers) {
            clearTimeout(channelStatus[channelId].timers[key]);
        }
    } else {
        channelStatus[channelId].timers = {};
    }
    // 通知済み状態リセット
    channelStatus[channelId].sent = {};
    const now = Date.now();
    const last = channelStatus[channelId].lastActivity;
    const channel = await client.channels.fetch(channelId);
    for (const key in intervals) {
        const delay = intervals[key] - (now - last);
        if (delay <= 0) {
            sendNotification(channel, key);
            channelStatus[channelId].sent[key] = true;
        } else {
            channelStatus[channelId].sent[key] = false;
            channelStatus[channelId].timers[key] = setTimeout(() => {
                sendNotification(channel, key);
                channelStatus[channelId].sent[key] = true;
                saveData();
            }, delay);
        }
    }
    saveData();
}

// 通知メッセージ送信関数（カスタムメッセージがあれば使用）
function sendNotification(channel, intervalKey) {
    const messageContent = customMessages[intervalKey] || '一定時間、メッセージがありまん。';
    const embed = new EmbedBuilder()
        .setTitle('過疎通知')
        .setDescription(messageContent)
        .setColor('Yellow')
        .setTimestamp();
    channel.send({ embeds: [embed] }).catch(console.error);
}

// 更新：指定チャンネルで非BOTメッセージがあった場合に最終時刻更新＆タイマー再設定
async function updateActivity(client, channelId) {
    if (!channelStatus[channelId]) {
        channelStatus[channelId] = { lastActivity: Date.now(), timers: {}, sent: {} };
    } else {
        channelStatus[channelId].lastActivity = Date.now();
    }
    await scheduleTimers(client, channelId);
}

// 初期化：読み込みと全チャンネルのタイマー設定、カスタム通知メッセージの上書きオプションも受け取る
function initInactivityNotifier(client, options = {}) {
    if (options.customMessages) {
        customMessages = { ...customMessages, ...options.customMessages };
    }
    loadData();
    for (const channelId of monitoredChannels) {
        if (!channelStatus[channelId]) {
            channelStatus[channelId] = { lastActivity: Date.now(), timers: {}, sent: {} };
        }
        scheduleTimers(client, channelId);
    }
}

module.exports = {
    initInactivityNotifier,
    updateActivity,
    monitoredChannels  // export so that index.js can check which channels to update
};
