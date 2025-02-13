/*以下 公開してもいいBOTの変数*/ 
const botver = '2.0.0-F'; // バージョン
/*Ver取り決め
A: アルファ(Alpha)
B: ベータ(Bata)
F: 未来の機能(ベータと同等)(Future)
R: 安定版(Release)
------------
〇.△.◇
〇: 大きな変更
△: 機能追加
◇: バグ修正
*/

/*以上 公開してもいいBOTの変数*/
require('dotenv').config();
const fs = require('fs');
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
// todo : 認証をライブラリに直で実装してボタンを押しても何をやってもEmbedに名前が入るような処理にする
const captcha = new Captcha (client,{
    roleID: `${memberRoleID}`, //optional
    channelID: '1267404959406882929', // 認証チャンネルのIDを入れています / optional
    sendToTextChannel: false, //optional, defaults to false
    addRoleOnSuccess: true, //optional, defaults to true. whether you want the bot to add the role to the user if the captcha is solved
    kickOnFailure: false, //optional, defaults to true. whether you want the bot to kick the user if the captcha is failed
    caseSensitive: true, //optional, defaults to true. whether you want the captcha responses to be case-sensitive
    attempts: 3, //optional, defaults to 1. number of attempts before captcha is considered to be failed
    timeout: 30000, //optional, defaults to 60000. time the user has to solve the captcha on each attempt in milliseconds
    showAttemptCount: true, //optional, defaults to true. whether to show the number of attempts left in embed footer
    customPromptEmbed: new EmbedBuilder()    
        .setTitle('認証を開始 - [DGS]DiscordGamersServer')
        .setColor('Blue')
        .setDescription(`ご参加ありがとうございます。\n以下の認証を行うと、[ルール<:url_icon:1325309186963148881>](https://discord.com/channels/1250416661522153553/1250416826513358951)に同意することとなります。\nルールをご確認されてから、以下の画像に表示されている文字列を入力してください。`)
        .setAuthor({name: 'DGS - DiscordGamersServer 運営BOT',})
        .setTimestamp()
        , //customise the embed that will be sent to the user when the captcha is requested
    customSuccessEmbed: new EmbedBuilder()
        .setTitle('認証に成功 - [DGS]DiscordGamersServer')
        .setColor('Green')
        .setDescription('雑談やゲーム関係の会話や募集、ミニゲーム(経済カテゴリ)などがご利用いただけます。\nこれからも当サーバーをよろしくお願いいたします。')
        .setAuthor({name: 'DGS - DiscordGamersServer 運営BOT',})
        .setTimestamp()
        , //customise the embed that will be sent to the user when the captcha is solved
    customFailureEmbed: new EmbedBuilder()
        .setTitle('認証に失敗 - [DGS]DiscordGamersServer')
        .setColor('Red')
        .setDescription('一度正しいか確認してから再度お試しください。\n(3回失敗すると、キックされます。)')
        .setAuthor({name: 'DGS - DiscordGamersServer 運営BOT',})
        .setTimestamp()
        , //customise the embed that will be sent to the user when they fail to solve the captcha
});
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

// Removed unused modules: path, diagnostics_channel and error from console.

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

client.on(Events.InteractionCreate, async interaction => {
    try {
        if (interaction.isChatInputCommand()) {
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
            } /*この上までにコマンド処理 → それでも見つからない場合*/else {
                await safeReply(interaction, { content: 'コマンドが見つかりませんでした。', ephemeral: true });
            }
        } 
        //モーダル処理
        //  modal 部分の処理を、bosyu コマンド用に「bosyu_modal_」で始まるものに変更
        else if (interaction.isModalSubmit()) {
            // 追加: モーダル送信の場合のルーティング
            const bosyu = require('./commands/bosyu.js');
            if (interaction.customId === 'bosyu_reservation_modal' || interaction.customId === 'bosyu_immediate_modal') {
                return bosyu.handleModalSubmit(interaction);
            } else if (interaction.customId === 'bosyu_reserve_time_modal') {
                return bosyu.handleReserveModalSubmit(interaction);
            } else if (interaction.customId === 'bosyu_edit_modal') {
                return bosyu.handleEditModalSubmit(interaction);
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
                // 修正: member ではなく interaction.member を渡す
                captcha.present(interaction.member);
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
    const roleformat = `┗内認証|済:${verifiedSize}|未:${unverifiedSize}`;
    
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
    console.log(data);
});

client.on('messageCreate', message => {
    msgCounter.handleMessage(message);
    //BOT含める処理 or BOTのみの処理
    if (message.author.id === '761562078095867916' && message.content.startsWith('/dissoku up')) {
        // サブコマンドの処理をここに記述
        message.reply({ content: 'サブコマンドが実行されました。', allowedMentions: { repliedUser: false } });
    }
    //ここまでBOT含める処理 or BOTのみの処理
    if (message.author.bot) return;
    //この先はBOTお断り
    const twitterRegex = /https:\/\/twitter\.com\/\S+/g;
    const xRegex = /https:\/\/x\.com\/\S+/g;

    let newMessageContent = message.content;
    // メッセージ送信者のメンションを取得
    const messageAuthor = `<@${message.author.id}>`;
    // Twitter URLの変換
    newMessageContent = newMessageContent.replace(twitterRegex, (url) => {
        const newUrl = url.replace('twitter.com', 'fxtwitter.com');
        return `${messageAuthor}が送信\n[PostURL](${newUrl})`;
    });

    // X URLの変換
    newMessageContent = newMessageContent.replace(xRegex, (url) => {
        const newUrl = url.replace('x.com', 'fixupx.com');
        return `${messageAuthor}が送信\n[PostURL](${newUrl})`;
    });

    if (newMessageContent !== message.content) {
        // 元のメッセージを削除
        message.delete().catch(console.error);

        // 変換されたメッセージを再送信
        message.channel.send(newMessageContent);
    }
    const loginData = loadLoginData();
    const userId = message.author.id;

    if (!loginData[userId] || loginData[userId] === 0) {
        if (message.channel.type === ChannelType.DM) {
            return};
        const url = `https://unbelievaboat.com/api/v1/guilds/1250416661522153553/users/${userId}`;
        const options = {
            method: 'PATCH',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                Authorization: `${token_unb}`
            },
            body: JSON.stringify({cash: 3000})
        }
        fetch(url, options)
            .then(res => res.json())
            .then(json => console.log(json))
            .catch(err => console.error('error:' + err));
        // 通常
        message.reply({ content:`<@${userId}>さん、こんにちは！\n\`今日初めてのログインです。 | 3000チー(カジノBOT通貨)をプレゼント!\``, allowedMentions: { repliedUser: false }});
        // 期間限定で変更中 
        // message.reply({ content:`<@${userId}>さん、こんにちは！\n\`今日初めてのログインです。(ログボ) | 期間限定で鯖主から記念で+2000!!! 5000チー(カジノBOT通貨)をプレゼント!\``, allowedMentions: { repliedUser: false }});
        loginData[userId] = 1; // ログインを1に設定
        saveLoginData(loginData);
    }
    //特定の文字列に返信
    const binzyo = ['かな','だよね','だよなぁ?','だよなぁ？','だよなぁ','だね','間違いない','だろ','なぁ？','なぁ?']
    const wan = ['ワン','ワン！','ワン!']
    const wan2 = ['ワンワン','ワンワン！','ワン！ワン！','ワン!ワン!','ワン!']
    const nurupo = ['ぬるぽ']
    if (binzyo.some(bark => message.content.endsWith(bark))) {
        message.reply({ content:`そうだワン！`, allowedMentions: { repliedUser: false }});
        return;
    } 
    //以下はぬるぽ単体で送られた場合のみ反応
    else if (wan2.some(bark => message.content === bark)) {
        message.reply({ content:`ワンワン！`, allowedMentions: { repliedUser: false }});
        return;
    } else if (wan.some(bark => message.content === bark)) {
        message.reply({ content:`ワン！`, allowedMentions: { repliedUser: false }});
        return;
    }
    if (nurupo.some(bark => message.content === bark)) {
        message.reply({ content: `ガッ`, allowedMentions: { repliedUser: false } });
        return;
    }
    }
);
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
    if (jstDate.getMonth() === 0 && jstDate.getDate() === 1) {
        channelName = "┠HappyNewYear!";
    } else {
        const nextJan1 = new Date(currentYear + 1, 0, 1);
        const diffDays = Math.ceil((nextJan1 - jstDate) / (1000 * 60 * 60 * 24));
        channelName = `┠新年まで${diffDays}日`;
    }
    const channel = client.channels.cache.get("1338449627963461675");
    if (channel) {
        await channel.setName(channelName);
        console.log(`新年チャンネル更新: ${channelName}`);
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
            channelName = `┠祝日: ${holiday}`;
        } else {
            // 祝日でない場合は既存ロジック（曜日により算出）
            const weekday = jstDate.getDay();
            switch (weekday) {
                case 0:
                    channelName = "┠月曜が近いよ♪";
                    break;
                case 1:
                    channelName = "┠月曜日ｲﾔﾀﾞｱｱｱ";
                    break;
                case 6:
                    channelName = "┠休日だよ！";
                    break;
                case 5:
                    channelName = "┠金曜日ﾀﾞｱｱｱ";
                    break;
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



//BOTの起動 tokenは.envに記述しておく
client.login(token)
