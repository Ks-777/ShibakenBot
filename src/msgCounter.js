const fs = require('fs');
const path = require('path');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const charts = require('./charts'); // 追加

// 新規：このコードと同じ階層にあるmsgCountDate.jsonを使用するための設定
const dataDir = __dirname;
const dataFilePath = path.join(dataDir, 'msgCountDate.json');

let dailyBotCount = 0;
let dailyNonBotCount = 0;
let clientInstance = null;

function loadMsgCountData() {
    if (!fs.existsSync(dataFilePath)) return {};
    try {
        return JSON.parse(fs.readFileSync(dataFilePath));
    } catch (err) {
        console.error("msgCountDate.json parse error:", err);
        return {};
    }
}

function saveMsgCountData(data) {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

// 当日分カウントを更新するヘルパー関数
function updateDailyCount() {
    const today = new Date().toISOString().slice(0, 10);
    let data = {};
    if (fs.existsSync(dataFilePath)) {
        try {
            data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
        } catch (error) {
            console.error('msgCountDate.json 読み込みエラー:', error);
            data = {};
        }
    }
    data[today] = (data[today] || 0) + 1;
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

// messageCreate イベントから呼び出す
function handleMessage(message) {
    if (!message.author) return;
    if (message.author.bot) dailyBotCount++;
    else dailyNonBotCount++;
    updateDailyCount();
}

async function postDailyReport() {
    if (!clientInstance) return;
    const now = new Date();
    // JST日時に変換し、YYYY-MM-DD形式の文字列を作成
    const jstString = now.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
    const jstDate = new Date(jstString);
    const year = jstDate.getFullYear();
    const month = ("0" + (jstDate.getMonth() + 1)).slice(-2);
    const day = ("0" + jstDate.getDate()).slice(-2);
    const dateKey = `${year}-${month}-${day}`;

    const totalCount = dailyBotCount + dailyNonBotCount;
    const embed = new EmbedBuilder()
        .setTitle(`${dateKey} のメッセージ数`)
        .addFields(
            { name: 'BOTを含むメッセージ数', value: `${totalCount}`, inline: true },
            { name: 'BOTを除くメッセージ数', value: `${dailyNonBotCount}`, inline: true }
        )
        .setColor('Blue')
        .setTimestamp();

    const button = new ButtonBuilder()
        .setCustomId('msgcounter_past7')
        .setLabel('過去7日分表示')
        .setStyle(ButtonStyle.Primary);
    const row = new ActionRowBuilder().addComponents(button);

    try {
        // スレッドID 1312307620333223937 へ送信
        const thread = await clientInstance.channels.fetch('1312307620333223937');
        if (thread) {
            await thread.send({ embeds: [embed], components: [row] });
        }
    } catch (err) {
        console.error("Daily report post error:", err);
    }

    // ファイルへ保存（過去7日分だけ保持）
    const allData = loadMsgCountData();
    allData[dateKey] = {
        total: totalCount,
        nonBot: dailyNonBotCount,
        bot: dailyBotCount
    };
    const keys = Object.keys(allData).sort();
    if (keys.length > 7) {
        const removeKeys = keys.slice(0, keys.length - 7);
        removeKeys.forEach(key => delete allData[key]);
    }
    saveMsgCountData(allData);

    // カウンターをリセット
    dailyBotCount = 0;
    dailyNonBotCount = 0;
}

function scheduleDailyReport() {
    const now = new Date();
    const jstNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
    // 次回JST 0時（真夜中）を求める
    const nextMidnight = new Date(jstNow.getFullYear(), jstNow.getMonth(), jstNow.getDate() + 1, 0, 0, 0);
    const delay = nextMidnight.getTime() - jstNow.getTime();
    setTimeout(async () => {
        await postDailyReport();
        scheduleDailyReport();
    }, delay);
}

function initMsgCounter(client) {
    clientInstance = client;
    scheduleDailyReport();
}

// ボタン押下時に過去7日分のデータをEmbedで提示（グラフ付き）
async function handlePast7Button(interaction) {
    const allData = loadMsgCountData();
    // 過去7日分のEmbed用テキスト
    const dates = Object.keys(allData).sort();
    const recentDates = dates.slice(-7);
    let description = '';
    recentDates.forEach(dateKey => {
        const data = allData[dateKey];
        description += `${dateKey}: BOT含む ${data.total} / BOT除く ${data.nonBot}\n`;
    });

    // グラフ画像の生成
    const lineChartBuffer = await charts.generateLineChart(allData);
    // 当日の日付を計算
    const now = new Date();
    const jstString = now.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
    const jstDate = new Date(jstString);
    const year = jstDate.getFullYear();
    const month = ("0" + (jstDate.getMonth() + 1)).slice(-2);
    const day = ("0" + jstDate.getDate()).slice(-2);
    const todayKey = `${year}-${month}-${day}`;
    const today = allData[todayKey] || { total: 0, nonBot: 0, bot: 0 };
    const barChartBuffer = await charts.generateBarChart(today);

    // Embed作成（送信用Embedには1枚ずつ画像を設定するため、2つのEmbedを送信）
    const embedLine = new EmbedBuilder()
        .setTitle('過去7日分のメッセージ数（折れ線グラフ）')
        .setDescription(description || 'データがありません')
        .setColor('Green')
        .setTimestamp()
        .setImage('attachment://lineChart.png');
  
    const embedBar = new EmbedBuilder()
        .setTitle('当日のメッセージ数（棒グラフ）')
        .setColor('Blue')
        .setTimestamp()
        .setImage('attachment://barChart.png');

    return interaction.reply({
        embeds: [embedLine, embedBar],
        files: [
            { attachment: lineChartBuffer, name: "lineChart.png" },
            { attachment: barChartBuffer, name: "barChart.png" }
        ],
        ephemeral: true
    });
}

module.exports = {
    handleMessage,
    initMsgCounter,
    handlePast7Button
};
