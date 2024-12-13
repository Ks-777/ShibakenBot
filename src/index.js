require('dotenv').config();
const token = process.env.token;
const token_unb = process.env.token_unb;
const { Client, MessageEmbed, GatewayIntentBits, Events, Message , ChannelType, EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, } = require('discord.js');
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

// コマンドファイル定義(処理用)
const helpFile = require('./commands/help.js');
const spaceFile = require('./commands/space.js');
const wadaiFile = require('./commands/wadai.js');
const memberFile = require('./commands/member.js');
const newsFile = require('./commands/news.js')
const tyouhanFile = require('./commands/tyouhan.js')
// 初めてログイン検知時使用
const loginDataFile = 'loginData.json';
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
// ログインデータを保存する
function saveLoginData(data) {
    fs.writeFileSync(loginDataFile, JSON.stringify(data, null, 2));
}
const fs = require('fs');
const path = require('path');

// ログインデータを保存する関数
function saveLoginData(data) {
    const loginDataFile = path.resolve(__dirname, 'loginData.json');
    fs.writeFileSync(loginDataFile, JSON.stringify(data, null, 2));
}

// JSTの0時に全員のログインデータをリセットする関数
function resetLoginDataAtMidnight() {
    const now = new Date();
    const utcMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 15, 0, 0); // JSTの0時はUTCの15時
    const timeUntilMidnight = utcMidnight - now.getTime();

    setTimeout(() => {
        const loginData = {};
        saveLoginData(loginData);
        console.log('ログインデータをリセットしました。');

        // 次のJSTの0時に再度リセットをスケジュール
        resetLoginDataAtMidnight();
    }, timeUntilMidnight);
}

// 初回実行
resetLoginDataAtMidnight();

// JST定義
const j_timezone = {timeZone: 'Asia/Tokyo'};

// ここでBOTが起動したときにさせたい処理
client.on('ready', () => {
    console.log(`Ready${client.user.tag}`);
    //ステータスの定期更新
    setInterval(() => {
        client.user.setActivity({
            name: `${client.ws.ping}ms|v1.0.0-R|/help`
        })
    }, 5000)
});

client.on(Events.InteractionCreate, async interaction => {

    // スラッシュコマンドが存在しない場合は何もしない(return)
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === helpFile.data.name) {
        try {
            await helpFile.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'コマンド実行時にエラーになりました。', ephemeral: true });
            } else {
                await interaction.reply({ content: 'コマンド実行時にエラーになりました。', ephemeral: true });
            }
        }
    }
    else if (interaction.commandName === spaceFile.data.name) {
        try {
            await spaceFile.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'コマンド実行時にエラーになりました。', ephemeral: true });
            } else {
                await interaction.reply({ content: 'コマンド実行時にエラーになりました。', ephemeral: true });
            }
        }
    }
    else if (interaction.commandName === wadaiFile.data.name) {
        try {
            await wadaiFile.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'コマンド実行時にエラーになりました。', ephemeral: true });
            } else {
                await interaction.reply({ content: 'コマンド実行時にエラーになりました。', ephemeral: true });
            }
        }
    }
    else if (interaction.commandName === memberFile.data.name) {
        try {
            await memberFile.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'コマンド実行時にエラーになりました。', ephemeral: true });
            } else {
                await interaction.reply({ content: 'コマンド実行時にエラーになりました。', ephemeral: true });
            }
        }
    }
    else if (interaction.commandName === newsFile.data.name) {
        try {
            await newsFile.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'コマンド実行時にエラーになりました。', ephemeral: true });
            } else {
                await interaction.reply({ content: 'コマンド実行時にエラーになりました。', ephemeral: true });
            }
        }
    }
    else if (interaction.commandName === tyouhanFile.data.name) {
        try {
            await tyouhanFile.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'コマンド実行時にエラーになりました。', ephemeral: true });
            } else {
                await interaction.reply({ content: 'コマンド実行時にエラーになりました。', ephemeral: true });
            }
        }
    }
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
        message.reply({ content:`<@${userId}>さん、こんにちは！\n\`今日初めてのログインです。3000チー(カジノBOT通貨)をプレゼント!\``, allowedMentions: { repliedUser: false }});
        loginData[userId] = 1; // ログインを1に設定
        saveLoginData(loginData);
    }
    /* いろんな文字返信テンプレート 
    メッセージがb又はcの時に反応するテンプレート
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


//BOTの起動 tokenは.envに記述しておく
client.login(token)