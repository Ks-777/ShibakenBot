require('dotenv').config();
const fs = require('fs');
const token = process.env.token;
const token_unb = process.env.token_unb;
const { AttachmentBuilder , MessageAttachment, ButtonStyle, TextInputBuilder, ModalBuilder, Client, MessageEmbed, ModalActionRowComponentBuilder, GatewayIntentBits, Events, Message , ChannelType, EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildEmojisAndStickers,
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

// コマンドファイル定義(処理用)
const helpFile = require('./commands/help.js');
const spaceFile = require('./commands/space.js');
const wadaiFile = require('./commands/wadai.js');
const memberFile = require('./commands/member.js');
const newsFile = require('./commands/news.js');
const tyouhanFile = require('./commands/tyouhan.js');
const verifyFile = require('./commands/verify-button.js');
// 初めてログイン検知時使用
const loginDataFile = 'loginData.json';
const omikujiDataFile = './commands/omikuji-save.json';
// ログインデータを読み込む
function loadLoginData() {
    if (fs.existsSync(loginDataFile)) {
        const rawData = fs.readFileSync(loginDataFile, 'utf8');
        if (rawData) {
            return JSON.parse(rawData);
        }
    }
    return {}; // ファイルが空または存在しない場合は空のオブジェクトを返す
}
// 認証用
const UnVerifyRoleID = '1250418930821107712'; // 削除するロールのID
const memberRoleID = '1250418409854730263'; // 付与するロールのID

const path = require('path');
const { channel } = require('diagnostics_channel');
const { error } = require('console');

// ログインデータを保存する関数
function saveLoginData(data) {
    fs.writeFileSync(loginDataFile, JSON.stringify(data, null, 2));
}

// おみくじデータを保存する関数
function saveOmikujiData(data) {
    fs.writeFileSync(omikujiDataFile, JSON.stringify(data, null, 2));
}

// JSTの0時に全員のログインデータとおみくじデータをリセットする関数
function resetDataAtMidnight() {
    const now = new Date();
    const utcMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 15, 0, 0); // JSTの0時はUTCの15時
    const timeUntilMidnight = utcMidnight - now.getTime();

    setTimeout(() => {
        const loginData = {};
        saveLoginData(loginData);
        console.log('ログインデータをリセットしました。');

        const omikujiData = {};
        saveOmikujiData(omikujiData);
        console.log('おみくじデータをリセットしました。');

        // 次のJSTの0時に再度リセットをスケジュール
        resetDataAtMidnight();
    }, timeUntilMidnight);
}

// 初回実行
resetDataAtMidnight();

// JST定義
const j_timezone = {timeZone: 'Asia/Tokyo'};

// ここでBOTが起動したときにさせたい処理
client.on('ready', () => {
    console.log(`Ready${client.user.tag}`);
    //ステータスの定期更新
    setInterval(() => {
        client.user.setActivity({
            name: `${client.ws.ping}ms|v1.5.1-B|/help`
        })
    }, 5000)
    //channelパネル更新
    channelPanelMemberCounter();
});

client.on(Events.InteractionCreate, async interaction => {

    try {
        //スラッシュコマンドじゃなかったら次
        if (!interaction.isChatInputCommand()) return;
        if (interaction.commandName === helpFile.data.name) {
            await helpFile.execute(interaction);
        }
        else if (interaction.commandName === spaceFile.data.name) {
            await spaceFile.execute(interaction);
        }
        else if (interaction.commandName === wadaiFile.data.name) {
            await wadaiFile.execute(interaction);
        }
        else if (interaction.commandName === memberFile.data.name) {
            await memberFile.execute(interaction);
        }
        else if (interaction.commandName === newsFile.data.name) {
            await newsFile.execute(interaction);
        }
        else if (interaction.commandName === tyouhanFile.data.name) {
            await tyouhanFile.execute(interaction);
        }
        else if (interaction.commandName === verifyFile.data.name) {
            await verifyFile.execute(interaction);
        }
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'コマンド実行時にエラーになりました。', ephemeral: true });
        } else {
            await interaction.reply({ content: 'コマンド実行時にエラーになりました。', ephemeral: true });
        }
    }
    //ボタン以外弾く
    if (!interaction.isButton()) return;

    if (interaction.customId === 'verify') {
        const member = interaction.user; // ボタンを押したユーザーを取得
        captcha.present(member);
    }
});
// messageCreateまで認証とchannel更新用用
async function channelPanelMemberCounter(){
    const memberSize = memberCount();
    const format = `メンバー数:`;
    return;
}
client.on('guildMemberAdd', member => {
    captcha.present(member);
    // メンバー数表示パネル更新(2)
    channelPanelMemberCounter()
});
//認証設定
const captcha = new Captcha (client,{
    roleID: `${memberRoleID}`, //optional
    channelID: '1267404959406882929', // 認証チャンネルのIDを入れています / optional
    sendToTextChannel: false, //optional, defaults to false
    addRoleOnSuccess: true, //optional, defaults to true. whether you want the bot to add the role to the user if the captcha is solved
    kickOnFailure: true, //optional, defaults to true. whether you want the bot to kick the user if the captcha is failed
    caseSensitive: true, //optional, defaults to true. whether you want the captcha responses to be case-sensitive
    attempts: 3, //optional, defaults to 1. number of attempts before captcha is considered to be failed
    timeout: 30000, //optional, defaults to 60000. time the user has to solve the captcha on each attempt in milliseconds
    showAttemptCount: true, //optional, defaults to true. whether to show the number of attempts left in embed footer
    customPromptEmbed: new EmbedBuilder()    
        .setTitle('認証を開始 - [DGS]DiscordGamersServer')
        .setColor('Blue')
        .setDescription(`ご参加ありがとうございます。\n以下の認証を行うと、[ルール<:url_icon:1325309186963148881>](https://discord.com/channels/1250416661522153553/1250416826513358951)に同意することとなります。\nルールをご確認されてから、以下の画像に表示されている文字列を入力してください。`)
        .setAuthor({name: 'DGS - DiscordGamersServer 運営BOT',})
        .setFields(
            [{name: 'このメッセージが認証チャンネルに送られている', value: 'このメッセージは参加者のDMが封鎖されている場合に、\n認証チャンネルに代わりに送信します。ご理解の程宜しくお願い申し上げます。'}])
        .setTimestamp()
        , //customise the embed that will be sent to the user when the captcha is requested
    customSuccessEmbed: new EmbedBuilder()
        .setTitle('認証に成功 - [DGS]DiscordGamersServer')
        .setColor('Green')
        .setDescription('雑談やゲーム関係の会話や募集、ミニゲーム(経済カテゴリ)などがご利用いただけます。\nこれからも当サーバーをよろしくお願いいたします。')
        .setAuthor({name: 'DGS - DiscordGamersServer 運営BOT',})
        .setFields(
            [{name: 'このメッセージが認証チャンネルに送られている', value: 'このメッセージは参加者のDMが封鎖されている場合に、\n認証チャンネルに代わりに送信します。ご理解の程宜しくお願い申し上げます。'}])
        .setTimestamp()
        , //customise the embed that will be sent to the user when the captcha is solved
    customFailureEmbed: new EmbedBuilder()
        .setTitle('認証に失敗 - [DGS]DiscordGamersServer')
        .setColor('Red')
        .setDescription('一度正しいか確認してから再度お試しください。\n(3回失敗すると、キックされます。)')
        .setAuthor({name: 'DGS - DiscordGamersServer 運営BOT',})
        .setFields(
            [{name: 'このメッセージが認証チャンネルに送られている', value: 'このメッセージは参加者のDMが封鎖されている場合に、\n認証チャンネルに代わりに送信します。ご理解の程宜しくお願い申し上げます。'}])
        .setTimestamp()
        , //customise the embed that will be sent to the user when they fail to solve the captcha
});
captcha.on('success', async data => {
    const channelId = '1250416661522153556';
    const channel = client.channels.cache.get(channelId);
    if (!channel) {
        console.error('チャンネルが見つかりません');
        return;
    }

    data.member.roles.remove(UnVerifyRoleID);

    const comemessage = ['参加しました！', '登場しました！', '誕生しました！', 'パーティーに参加しました！', 'やってきた！', '飛び出してきたぞ！'];
    const randcome = Math.floor(Math.random() * comemessage.length);
    const newcomemessage = comemessage[randcome];
    const memberName = data.member.nickname || data.member.user.username; // nickNameがない場合ユーザーネームを使う
    const memberSize = memberCount(); // 非同期関数を使用
    const memberId = data.member.id;

    const welcomeMessage = new EmbedBuilder()
        .setTitle(`こんにちは！ ${memberName}さんが${newcomemessage}`)
        .setDescription('Shibaken - 認証が完了したユーザーの紹介')
        .addFields(
        { name: 'あいさつをしよう！', value: 'スタンプなどを使って新規さんに挨拶しよう！' },
        { name: 'UserInfo', value: '開発中', inline: true },
        { name: 'ServerInfo', value: `総メンバー数: ${memberSize}`, inline: true }
        )
        .setColor('Aqua')
        .setTimestamp();

    channel.send({ content: `<@${memberId}>さんこんにちは！`, embeds: [welcomeMessage] });
    console.log(data);
});

client.on('messageCreate', message => {
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
    /* いろんな文字返信テンプレート 
    メッセージがb又はcの時に反応するテンプレート
    important!!! : YOU CAN'T USE THIS TENPLATE. BECAUSE THIS TENPLATE DOESN'T WORK.
    const a = ['b','c']
    if (message.content == b || message.content == c){
        message.reply({ content:`返信させたいメッセージ`, allowedMentions: { repliedUser: false }});
    }

    b又はcが含まれてるときに反応するテンプレート
    const a = ['b','c']
    if (message.content.includes(a)){
        message.reply({ content:`返信させたいメッセージ`, allowedMentions: { repliedUser: false }});
    }
    
    b又はcが文字列の最後にあるときに反応するテンプレート
    const a = ['b','c']
    if (message.content.endsWith(a)) {
        message.reply({ content:`返信させたいメッセージ`, allowedMentions: { repliedUser: false }});
    }
    */

    //特定の文字列に返信
    const binzyo = ['かな','だよね','だよなぁ?','だよなぁ？','だよなぁ','だね','間違いない','だろ','なぁ？','なぁ?']
    const wan = ['ワン','ワン！','ワン!']
    const wan2 = ['ワンワン','ワンワン！','ワン！ワン！','ワン!ワン!','ワン!']
    if (binzyo.some(bark => message.content.includes(bark))) {
        message.reply({ content:`そうだワン！`, allowedMentions: { repliedUser: false }});
        return;
    }else if (wan2.some(bark => message.content.includes(bark))){
        message.reply({ content:`ワンワン！`, allowedMentions: { repliedUser: false }});
        return;
    }else if (wan.some(bark => message.content.includes(bark))){
        message.reply({ content:`ワン！`, allowedMentions: { repliedUser: false }});
        return;
    }
});
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