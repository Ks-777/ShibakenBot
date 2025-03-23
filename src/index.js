/*以下 公開してもいいBOTの変数*/ 
const botver = '2.0.0[Ex]'; // バージョン
/*Ver取り決め
A: アルファ(Alpha)
B: ベータ(Bata)
F: 未来の機能(ベータと同等)(Future)
R: 安定版(Release)
NExT: 新世代(Next)
-下記歴代スペシャルバージョン一覧-
Ex: すごいバージョン(Extend) - v2.0.0
Nx: 新世代(Next) - v3.0.0
SSR: ｽｰﾊﾟｰｽﾍﾟｼｬﾙﾚｱ(?) - v4.0.0
USSR: ｳﾙﾄﾗｽｰﾊﾟｰｽﾍﾟｼｬﾙﾚｱ(?) - v5.0.0
------------
〇.△.◇
〇: 大きな変更
△: 機能追加
◇: バグ修正
*/

/*以上 公開してもいいBOTの変数*/
require('dotenv').config();
const fs = require('fs');
const fetch = require('node-fetch');
const token = process.env.token;
const token_unb = process.env.token_unb;
const { Client, GatewayIntentBits, Events, ChannelType, EmbedBuilder } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildExpressions,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
        Object.values(GatewayIntentBits).reduce((a, b) => a | b)
    ]
});

const { Captcha } = require("discord.js-captcha");
// 認証設定
const UnVerifyRoleID = '1250418930821107712'; // 削除するロールのID
const memberRoleID = '1250418409854730263'; // 付与するロールのID
// 認証しているユーザー名をEmbedのタイトルに反映するため、埋め込み内で {member} のようなテンプレート文字列を使用します。
const captcha = new Captcha(client, {
    roleID: `${memberRoleID}`, //optional
    channelID: '1267404959406882929', // 認証チャンネルのIDを指定 / optional
    sendToTextChannel: false, //optional, defaults to false
    addRoleOnSuccess: true, //optional, defaults to true. ロール付与を行うかどうか
    kickOnFailure: false, //optional, defaults to true. 認証失敗時にキックするかどうか
    caseSensitive: false, //optional, defaults to true. 大文字小文字の区別をするかどうか
    attempts: 334, //optional, defaults to 1. 失敗許容回数
    timeout: 60000, // 修正: timeoutを十分な値（例:60000ms）に変更
    showAttemptCount: true, //optional, defaults to true. 試行回数をEmbedフッターに表示するかどうか
    customPromptEmbed: new EmbedBuilder()
        .setTitle('認証を開始 - {member}さん - [DGS]DiscordGamersServer')
        .setColor('Blue')
        .setDescription(`ご参加ありがとうございます。\n以下の認証を行うと、[ルール<:url_icon:1325309186963148881>](https://discord.com/channels/1250416661522153553/1250416826513358951)に同意することとなります。\nルールをご確認の上、以下の画像に表示されている文字列を入力してください。`)
        .setAuthor({ name: 'DGS - DiscordGamersServer 運営BOT' })
        .setFooter({ text: 'TIPS:大文字小文字関係なく入力可能' })
        .setTimestamp(),
    customSuccessEmbed: new EmbedBuilder()
        .setTitle('認証に成功 - {member}さん - [DGS]DiscordGamersServer')
        .setColor('Green')
        .setDescription('雑談やゲーム関係の会話や募集、ミニゲーム(経済カテゴリ)などをご利用いただけます。\nこれからも当サーバーをよろしくお願いいたします。')
        .setAuthor({ name: 'DGS - DiscordGamersServer 運営BOT' })
        .setTimestamp(),
    customFailureEmbed: new EmbedBuilder()
        .setTitle('認証に失敗 - {member}さん - [DGS]DiscordGamersServer')
        .setColor('Red')
        .setDescription('正しい文字列かご確認の上、再度お試しください。\n(3回失敗すると、キックされます。)')
        .setAuthor({ name: 'DGS - DiscordGamersServer 運営BOT' })
        .setTimestamp(),
});
// キャプチャ処理の前に、captcha.present() をパッチして動的置換を行う
const originalPresent = captcha.present.bind(captcha);
captcha.present = async function(member, customCaptcha) {
    // 各Embedをクローンしてタイトルの {member} を実際のdisplayNameに置換
    if (this.options.customPromptEmbed) {
        this.options.customPromptEmbed = new EmbedBuilder(this.options.customPromptEmbed)
            .setTitle(this.options.customPromptEmbed.data.title.replace('{member}', member.displayName));
    }
    if (this.options.customSuccessEmbed) {
        this.options.customSuccessEmbed = new EmbedBuilder(this.options.customSuccessEmbed)
            .setTitle(this.options.customSuccessEmbed.data.title.replace('{member}', member.displayName));
    }
    if (this.options.customFailureEmbed) {
        this.options.customFailureEmbed = new EmbedBuilder(this.options.customFailureEmbed)
            .setTitle(this.options.customFailureEmbed.data.title.replace('{member}', member.displayName));
    }
    return originalPresent(member, customCaptcha);
};
// コマンドファイル定義(処理用)
const helpFile = require('./commands/help.js');
const spaceFile = require('./commands/space.js');
const wadaiFile = require('./commands/wadai.js');
const memberFile = require('./commands/member.js');
const newsFile = require('./commands/news.js');
const tyouhanFile = require('./commands/tyouhan.js');
const verifyFile = require('./commands/verify-button.js');
const embedFile = require('./commands/embed.js');
const bosyuFile = require('./commands/bosyu.js');
const bosyuInfoFile = require('./commands/bosyu-info.js');
const msgCounter = require('./msgCounter');
const pinFile = require('./commands/pin.js');


// 初めてログイン検知時使用
const loginDataFile = 'loginData.json';
const omikujiDataFile = './commands/omikuji-save.json';
function loadLoginData() {
    if (fs.existsSync(loginDataFile)) {
        const rawData = fs.readFileSync(loginDataFile, 'utf8');
        if (rawData) {
            return JSON.parse(rawData);
        }
    }
    return {}; // ファイルが空または存在しない場合は空のオブジェクトを返す
}

// ログインデータを保存する関数
function saveLoginData(data) {
    fs.writeFileSync(loginDataFile, JSON.stringify(data, null, 2));
}

// おみくじデータを保存する関数
function saveOmikujiData(data) {
    fs.writeFileSync(omikujiDataFile, JSON.stringify(data, null, 2));
}
// JSTの0時に実行系
function resetDataAtMidnight() {
    const now = new Date();
    // JSTの現在日時を取得
    const nowJST = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
    // JSTの次の0時（真夜中）を取得
    const nextMidnightJST = new Date(nowJST.getFullYear(), nowJST.getMonth(), nowJST.getDate() + 1, 0, 0, 0);
    const timeUntilMidnight = nextMidnightJST.getTime() - nowJST.getTime();

    setTimeout(async () => {
        const loginData = {};
        saveLoginData(loginData);
        console.log('ログインデータをリセットしました。');

        const omikujiData = {};
        saveOmikujiData(omikujiData);
        console.log('おみくじデータをリセットしました。');
        
        // チャンネル更新
        await updateRokuyoChannel();
        await channelPanelNewYear();
        await channelPanelHoliday();

        // 次のJSTの0時に再度リセットをスケジュール
        resetDataAtMidnight();
    }, timeUntilMidnight);
}

// 初回実行
resetDataAtMidnight();

client.on('ready', () => {
    console.log(`Ready ${client.user.tag}`);
    msgCounter.initMsgCounter(client);
    // ステータスの定期更新
    setInterval(() => {
        client.user.setActivity({
            name: `${client.ws.ping}ms|v${botver}|/help`
        });
    }, 5000);
    // 起動時に一回実行
    // 次回からchannelPanelMemberCounterを30分に一回実行するコード
    channelPanelMemberCounter();
    setInterval(async () => {
        await channelPanelMemberCounter();
    }, 30 * 60 * 1000);
    
    // 追加: Rokuyoチャンネル更新（起動時）
    updateRokuyoChannel();

    // 追加: 日付・新年・休日チャンネル更新（起動時）
    channelPanelNewYear();
    channelPanelHoliday();
});

// 追加: Unknown interaction エラーをハンドルするためのラッパー関数
async function safeReply(interaction, options) {
    try {
        // 返信前に必ず deferReply を実施（既に返信済みの場合は不要） 
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply({ ephemeral: true });
        }
        await interaction.editReply(options);
    } catch (error) {
        if (error.code === 10062) {
            console.warn('Unknown interaction error caught and ignored.');
        } else {
            throw error;
        }
    }
}

// 追加: ユーザーごとのコマンド実行記録（過去60秒以内のタイムスタンプ）と直前の実行情報
const userCommandTimestamps = {}; // { [userId]: number[] }
const userLastCommand = {}; // { [userId]: { timestamp: number, command: string } }

client.on(Events.InteractionCreate, async interaction => {
    try {
        if (interaction.isChatInputCommand()) {
            const userId = interaction.user.id;
            const now = Date.now();

            // 過去60秒以内の記録を更新
            if (!userCommandTimestamps[userId]) userCommandTimestamps[userId] = [];
            userCommandTimestamps[userId] = userCommandTimestamps[userId].filter(ts => now - ts < 60000);
            
            // 1分間に20回以上の実行チェック
            if (userCommandTimestamps[userId].length >= 20) {
                return interaction.reply({ content: '1分間に20回以上の実行があったため、クールタイム中です。', ephemeral: true });
            }
            
            // 直前実行チェック（全コマンド共通: 3秒以内） 
            if (userLastCommand[userId] && (now - userLastCommand[userId].timestamp < 3000)) {
                return interaction.reply({ content: 'コマンドの連続実行は3秒間隔以上空けてください。', ephemeral: true });
            }
            // 同じコマンドの直前実行チェック: 5秒以内は実行しない
            if (userLastCommand[userId] && userLastCommand[userId].command === interaction.commandName && (now - userLastCommand[userId].timestamp < 5000)) {
                return interaction.reply({ content: '同じコマンドは5秒以内に再実行できません。', ephemeral: true });
            }
            
            // 記録更新
            userCommandTimestamps[userId].push(now);
            userLastCommand[userId] = { timestamp: now, command: interaction.commandName };

            //ここからコマンド処理
            if (interaction.commandName === helpFile.data.name) {
                await helpFile.execute(interaction);
            } else if (interaction.commandName === spaceFile.data.name) {
                await spaceFile.execute(interaction);
            } else if (interaction.commandName === wadaiFile.data.name) {
                await wadaiFile.execute(interaction);
            } else if (interaction.commandName === memberFile.data.name) {
                await memberFile.execute(interaction);
            } else if (interaction.commandName === newsFile.data.name) {
                await newsFile.execute(interaction);
            } else if (interaction.commandName === tyouhanFile.data.name) {
                await tyouhanFile.execute(interaction);
            } else if (interaction.commandName === verifyFile.data.name) {
                await verifyFile.execute(interaction);
            } else if (interaction.commandName === embedFile.data.name) {
                await embedFile.execute(interaction);
            } else if (interaction.commandName === bosyuFile.data.name) {
                await bosyuFile.execute(interaction);
            } else if (interaction.commandName === bosyuInfoFile.data.name) {
                await bosyuInfoFile.execute(interaction);
            } else if (interaction.commandName === pinFile.data.name) {
                await pinFile.execute(interaction);
            } /*この上までにコマンド処理 → それでも見つからない場合*/else {
                await safeReply(interaction, { content: 'コマンドが見つかりませんでした。', ephemeral: true });
            }
        } 
        //モーダル処理
        //  modal 部分の処理を、bosyu コマンド用に「bosyu_modal_」で始まるものに変更
        else if (interaction.isModalSubmit()) {
            // 追加: モーダル送信の場合のルーティング
            const bosyu = require('./commands/bosyu.js');
            const pin = require('./commands/pin.js');
            if (interaction.customId === 'bosyu_reservation_modal' || interaction.customId === 'bosyu_immediate_modal') {
                return bosyu.handleModalSubmit(interaction);
            } else if (interaction.customId === 'bosyu_reserve_time_modal') {
                return bosyu.handleReserveModalSubmit(interaction);
            } else if (interaction.customId === 'bosyu_edit_modal') {
                return bosyu.handleEditModalSubmit(interaction);
            } else if (interaction.customId === 'pin_normal') {
                return pin.handleNormalModalSubmit(interaction);
            }

        }
        //ボタン処理
        else if (interaction.isButton()) {
            // 過去7日分表示ボタンの処理
            if (interaction.customId === 'msgcounter_past7') {
                await msgCounter.handlePast7Button(interaction);
                return;
            }
            // 修正: customIdが "bosyu_" で始まる場合にbosyuFile.handleButtonを呼び出す
            else if (interaction.customId.startsWith("bosyu_")) {
                await bosyuFile.handleButton(interaction);
            } else if (interaction.customId === 'verify') {
                try {
                    await captcha.present(interaction.member);
                } catch (err) {
                    if (err.code === 50007) {
                        // DM送信不可の場合、sendToTextChannel を有効化して再送信
                        captcha.options.sendToTextChannel = true;
                        await captcha.present(interaction.member);
                    } else {
                        console.error(err);
                    }
                }
                return;
            }
        }
        //メッセージ系はindex.js下部に記述
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await safeReply(interaction, { content: '実行時にエラーになりました。', ephemeral: true });
        } else {
            await safeReply(interaction, { content: '実行時にエラーになりました。', ephemeral: true });
        }
    }
});
// messageCreateまで認証とchannel更新用用

async function channelPanelMemberCounter(){
    const memberChannelId = '1263049385478983710';
    const roleChannelId = '1281995744194199692';
    // 先に各値を取得
    const memberSize = memberCount();
    const botSize = botCount();
    const verifiedroleSize = memberCount(true);
    const verifiedSize = verifiedroleSize - botSize;
    const unverifiedSize = memberSize - verifiedSize;
    // その後、フォーマット文字列を作成
    const memberformat = `┠メンバー数: ${memberSize}`;
    const roleformat = `┠内認証|済:${verifiedSize}|未:${unverifiedSize}`;
    
    const memberChannel = client.channels.cache.get(memberChannelId);
    if (memberChannel) {
        await memberChannel.setName(memberformat);
    } else {
        console.error('メンバー数表示チャンネルが見つかりません');
    }
    const roleChannel = client.channels.cache.get(roleChannelId);
    if (roleChannel) {
        await roleChannel.setName(roleformat);
    } else {
        console.error('認証数表示チャンネルが見つかりません');
    }
    return;
}

client.on('guildMemberAdd', member => {
    // 誰か参加したら、1298255950330724433(認証方法のチャンネルID)にメンションを送って送った後すぐに消して通知だけ飛ばすコード
    const channelId = '1298255950330724433';
    const channel = client.channels.cache.get(channelId);
    if (!channel) {
        console.error('チャンネルが見つかりません');
        return;
    }
    channel.send(`<@${member.id}>`)
        .then(sentMessage => {
            // 3秒後にメッセージを削除
            setTimeout(() => {
                sentMessage.delete().catch(console.error);
            }, 3000);
        })
        .catch(console.error);
    
    captcha.present(member);
    // メンバー数表示パネル更新(2)
});
captcha.on('failure', async data => {
    const displayName = data.member.displayName;
    const memberTag = data.member.user.username;
    const fullName = `${displayName} (${memberTag})`;
    console.log(`${fullName} さんが認証に失敗しました。`);
});
captcha.on('success', async data => {
    const channelId = '1250416661522153556';
    const channel = client.channels.cache.get(channelId);
    if (!channel) {
        console.error('チャンネルが見つかりません');
        return;
    }
    data.member.roles.remove(UnVerifyRoleID);

    const comemessage = ['参加しました！', '登場しました！', '誕生しました！', 'パーティーに参加しました！', 'やってきた！', '飛び出してきたぞ！', '', ''];
    const randcome = Math.floor(Math.random() * comemessage.length);
    const newcomemessage = comemessage[randcome];

    const displayName = data.member.displayName;
    const memberTag = data.member.user.username;
    const fullName = `${displayName} (${memberTag})`;

    const memberSize = memberCount();
    const botSize = botCount();
    const allmemberSize = memberSize + botSize;
    const memberId = data.member.id;
    const member = data.member;
    const memberCreatedAt = `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`;
    const memberJoinedAt = `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`;
    const memberAvatar = data.member.user.displayAvatarURL({ dynamic: true });

    const welcomeMessage = new EmbedBuilder()
        .setTitle(`こんにちは！ ${fullName}さんが${newcomemessage}`)
        .setDescription('Shibaken - 認証が完了したユーザーの紹介')
        .addFields(
            { name: 'あいさつをしよう！', value: 'スタンプなどを使って新規さんに挨拶しよう！' },
            { name: 'アカウント作成日時', value: memberCreatedAt, inline: true },
            { name: 'サーバー参加日時', value: memberJoinedAt, inline: true },
            { name: 'サーバー情報', value: `__総メンバー数 :__ ${memberSize}\n(内BOT数:${botSize}|全体:${allmemberSize})`, inline: true },
            { name: '自己紹介をしよう！', value: '[こちらから自己紹介ができます](https://discord.com/channels/1250416661522153553/1271837472401260596)', inline: true }
        )
        .setThumbnail(memberAvatar)
        .setColor('Aqua')
        .setTimestamp();

    const logChannelId = '1334426403797471282';
    const logChannel = client.channels.cache.get(logChannelId);
    if (!logChannel) {
        console.error('ログチャンネルが見つかりません');
        return;
    }

    const logEmbed = new EmbedBuilder()
        .setTitle('新規メンバー認証完了')
        .setDescription(`${fullName}さんが認証を完了しました。`)
        .addFields(
            { name: 'ユーザー名', value: fullName, inline: true },
            { name: 'ユーザーID', value: memberId, inline: true },
            { name: 'アカウント作成日時', value: memberCreatedAt, inline: true },
            { name: 'サーバー参加日時', value: memberJoinedAt, inline: true }
        )
        .setThumbnail(memberAvatar)
        .setColor('Green')
        .setTimestamp();

    logChannel.send({ embeds: [logEmbed] });
    channel.send({ content: `<@${memberId}>さんようこそ！`, embeds: [welcomeMessage] });
    console.log(`${fullName} さんが認証を完了しました。`);
});

// 追加: 過疎通知用の監視変数・閾値
/* 暫くの間、過疎通知をオフにして運用
const inactivityData = {
	'1250416661522153556': { lastActivity: Date.now(), triggered: {} },
	'1258327116035002378': { lastActivity: Date.now(), triggered: {} }
};

const thresholds = [
	{ time: 15 * 60 * 1000, label: "15分" },
	{ time: 30 * 60 * 1000, label: "30分" },
	{ time: 60 * 60 * 1000, label: "1時間" },
	{ time: 3 * 60 * 1000, label: "3時間" },
	{ time: 8 * 60 * 1000, label: "8時間" }
];

// 追加: 1分毎に過疎チェックを実行
setInterval(() => {
	const now = Date.now();
	// 現在のJST時刻（0～23）を取得
	const currentHour = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
	const hour = new Date(currentHour).getHours();
	// 除外時間帯: 深夜(2～7) および 平日日中(9～15)
	const isExcluded = (hour >= 2 && hour < 7) || (hour >= 9 && hour < 15);

	['1250416661522153556', '1258327116035002378'].forEach(channelId => {
		const data = inactivityData[channelId];
		// 除外時間帯ならタイマーリセット
		if(isExcluded){
			data.lastActivity = now;
			data.triggered = {};
			return;
		}
		const elapsed = now - data.lastActivity;
		thresholds.forEach(threshold => {
			if(elapsed >= threshold.time && !data.triggered[threshold.time]){
				// 送信済みマークをセット
				data.triggered[threshold.time] = true;
				const channel = client.channels.cache.get(channelId);
				if(!channel) return;
				// 夜･深夜帯: (23～24 または 0～9)の場合Embedで送信
                const messages = [
                    "サーバーの心肺が停止！ そこのあなた！AED(過密)を！",
                    "過疎だｱｱｱｱｱｱｱｱｱｱｱｱｱｱｱｱ ﾄﾞｯｯｶｧｱﾝ(爆死)",
                    "過疎だよ(´・ω・｀)",
                    "(過疎だから)乗るしかないよね、このビックウェーブに。",
                    "過疎ｿｿｿｿｿｿｿｿ(バグ発生)",
                    "ｶ....ｿ.......(遺言)"
                ];
                const kasomsg = messages[Math.floor(Math.random() * messages.length)];
				if(hour >= 23 || hour < 9){
					const embed = new EmbedBuilder()
						.setTitle(`${kasomsg} - 過疎通知`)
						.setDescription(`${threshold.label}間、会話がありません…皆さん、ゆっくりお休みですか？`)
						.setColor('DarkBlue')
						.setTimestamp();
					channel.send({ content: '過疎通知 - Shibaken', embeds: [embed] });
				} else {
                    const embed = new EmbedBuilder()
                        .setTitle(`【${threshold.label}】${kasomsg} - 過疎通知`)
                        .setDescription(`最近、${threshold.label}間会話がないようです。盛り上げてみませんか？`)
					channel.send(`最近、${threshold.label}間会話がないようです。盛り上げてみませんか？`);
				}
			}
		});
	});
}, 60 * 1000);
*/
client.on('messageCreate', message => {
    // BOTのメッセージなどの仕分けはhandleMessage内で行うため、BOTを跳ね返す前に実装
    msgCounter.handleMessage(message);
    if (message.author.bot) return;
    const messageContent = message.content;
    /*twitter.comとx.comをそれぞれfxtwitter.comとfixupx.comに変換 
    更にそれが含まれていたメッセージを消し変換したURLと一緒に送信
    (例：https://twitter.com/hoge/fuga → https://fxtwitter.com/hoge/fuga)
    */
    const fixedMessage = messageContent.replace(/twitter\.com/g, 'fxtwitter.com').replace(/x\.com/g, 'fixupx.com');
    if (messageContent !== fixedMessage) {
        message.delete().catch(console.error);
        const msgch = client.channels.cache.get(message.channel.id);
        const convertedUrls = (fixedMessage.match(/https:\/\/(?:fxtwitter\.com|fixupx\.com)\/\S+/g) || []).join('\n');
        const originalMsgWithoutUrls = messageContent.replace(/https:\/\/(?:twitter\.com|x\.com)\/\S+/g, '').trim() || 'なし';
        const urlEmbed = new EmbedBuilder()
            .setTitle(`${message.member.displayName} - Twitter/X URL変換`)
            .setDescription('TwitterやXのURLを自動で特殊Embedつきに変換しています\n(https://fxtwitter.com/)')
            .addFields(
                { name: '元メッセージ', value: originalMsgWithoutUrls, inline: true }
            )
            .setColor('Green')
            .setTimestamp();
        // Only send URL message if there is non-empty content
        if (convertedUrls.trim() !== "") {
            msgch.send({ content: `${convertedUrls}` });
        }
        msgch.send({ embeds: [urlEmbed] });
    }
    // ログインボーナス処理（初回ログイン時）
    const loginData = loadLoginData();
    const userId = message.author.id;
    if (!message.author.bot && (!loginData[userId] || loginData[userId] === 0)) {
        if (message.channel.type !== ChannelType.DM) {
            const housyu = 3000;
            // Unbelievaboatのボーナス処理(API)
            const url = `https://unbelievaboat.com/api/v1/guilds/1250416661522153553/users/${userId}`;
            const options = {
                method: 'PATCH',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `${token_unb}`
                },
                body: JSON.stringify({ cash: housyu })
            };
            fetch(url, options)
                .then(res => res.json())
                .then(json => console.log(json))
                .catch(err => console.error('error:' + err));
            const lbembed = new EmbedBuilder()
                .setTitle('ログインありがとうございます - ログインボーナス')
                .setDescription(`ログインボーナスとして${housyu}ポイントを付与しました。`)
                .setAuthor({ name: 'ShibakenBot - ログインボーナス' })
                .setColor('Green')
                .setTimestamp();
            message.reply({ content: `<@${userId}> ログインしました。`, allowedMentions: { repliedUser: false } , embeds: [lbembed]});
            loginData[userId] = 1;
            saveLoginData(loginData);
        }
    }
});
function botCount() {
    const guild = client.guilds.cache.get('1250416661522153553');

    const members = guild.members.cache;
    const botSize = members.filter(member => member.user.bot).size;

    return botSize;
}

// 新規追加: JSTの日時からチャンネル名を更新する関数
async function updateRokuyoChannel() {
    try {
        // JST日時の取得
        const now = new Date();
        const jstString = now.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
        const jstDate = new Date(jstString);
        const yearShort = String(jstDate.getFullYear()).slice(-2);
        const month = ("0" + (jstDate.getMonth() + 1)).slice(-2);
        const day = ("0" + jstDate.getDate()).slice(-2);
        const weekdays = ['日','月','火','水','木','金','土'];
        const weekday = weekdays[jstDate.getDay()];
        // Set channel name without using the Rokuyo API
        const channelName = `┠${yearShort}/${month}/${day}(${weekday})`;
        
        const channel = client.channels.cache.get("1263047438084735016");
        if (channel) {
            await channel.setName(channelName);
            console.log(`Rokuyoチャンネル更新: ${channelName}`);
        } else {
            console.error("Rokuyo更新用チャンネルが見つかりません");
        }
    } catch (err) {
        console.error("Rokuyoチャンネル更新エラー:", err);
    }
}

async function channelPanelNewYear() {
    const now = new Date();
    const jstString = now.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
    const jstDate = new Date(jstString);
    const currentYear = jstDate.getFullYear();
    let channelName = "";
    const channel = client.channels.cache.get("1338449627963461675");
    if (jstDate.getMonth() === 0 && jstDate.getDate() === 1) {
        channelName = "┠HappyNewYear!";
        console.log(`新年チャンネル更新: HappyNewYear!`);
    } else {
        const nextJan1 = new Date(currentYear + 1, 0, 1);
        const diffDays = Math.ceil((nextJan1 - jstDate) / (1000 * 60 * 60 * 24));
        channelName = `┠新年まで${diffDays}日`;
        console.log(`新年チャンネル更新: ${diffDays}日`);
    }
    if (channel) {
        await channel.setName(channelName);
    } else {
        console.error("新年チャンネルが見つかりません");
    }
}

async function channelPanelHoliday() {
    try {
        // JST日時の取得
        const now = new Date();
        const jstString = now.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
        const jstDate = new Date(jstString);
        const month = ("0" + (jstDate.getMonth() + 1)).slice(-2);
        const day = ("0" + jstDate.getDate()).slice(-2);
        const targetyyyy = jstDate.getFullYear();
        
        // 新しい祝日のAPI呼び出し（holidays-jp API） 
        const url = `https://holidays-jp.github.io/api/v1/date.json?date=${targetyyyy}-${month}-${day}`;
        const response = await fetch(url);
        let holiday = "";
        if (response.ok) {
            const data = await response.json();
            const dateKey = `${targetyyyy}-${month}-${day}`;
            holiday = data[dateKey] || "";
        }
        
        let channelName = "";
        if (holiday) {
            channelName = `┠${holiday}`;
        } else {
            // 祝日でない場合は既存ロジック（曜日により算出）
            const weekday = jstDate.getDay();
            switch (weekday) {
                case 0: {
                    const messages = [
                        "┠月曜が近いよ♪",
                        "┠月曜が近いヨ💦"
                    ];
                    channelName = messages[Math.floor(Math.random() * messages.length)];
                    break;
                }
                case 1: {
                    const messages = [
                        "┠月曜日ｲﾔﾀﾞｱｱｱ",
                        "┠月曜だ.......",
                        "┠もう月曜日!?!?"
                    ];
                    channelName = messages[Math.floor(Math.random() * messages.length)];
                    break;
                }
                case 6: {
                    const messages = [
                        "┠休日だよ！",
                        "┠ZZZZZ....",
                        "┠日曜が近いよ♪"
                    ];
                    channelName = messages[Math.floor(Math.random() * messages.length)];
                    break;
                }
                case 5: {
                    const messages = [
                        "┠金曜日ﾀﾞｱｱｱ",
                        "┠金曜日共栄圏万歳",
                        "┠金曜日金曜日金曜日"
                    ];
                    channelName = messages[Math.floor(Math.random() * messages.length)];
                    break;
                }
                default: {
                    const diff = 5 - weekday;
                    channelName = `┠金曜日まで${diff}日`;
                    break;
                }
            }
        }
        const channel = client.channels.cache.get("1338449741020794902");
        if (channel) {
            await channel.setName(channelName);
            console.log(`休日チャンネル更新: ${channelName}`);
        } else {
            console.error("休日チャンネルが見つかりません");
        }
    } catch (err) {
        console.error("channelPanelHoliday更新エラー:", err);
    }
}

// 汎用関数
function memberCount() {
    const guild = client.guilds.cache.get('1250416661522153553');
    
    const members = guild.members.cache;
    const memberSize = members.filter(member => !member.user.bot).size;
    
    return memberSize;
}

function botCount() {
    const guild = client.guilds.cache.get('1250416661522153553');

    const members = guild.members.cache;
    const botSize = members.filter(member => member.user.bot).size;

    return botSize;
}

//BOTの起動 tokenは.envに記述しておく
client.login(token)
