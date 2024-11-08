require('dotenv').config();
const fs = require('fs');
const token = process.env.token;
const token_unb = process.env.token_unb;
const { Client, MessageEmbed, GatewayIntentBits, Events, Message , ChannelType, EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, } = require('discord.js');
var client = new Client({
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
// 初めてログイン検知時使用
const loginDataFile = 'log-msg.json';
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
// 0時に全員のログインデータをリセットする関数
function resetLoginDataAtMidnight() {
    const now = new Date().toLocaleString('en-US', j_timezone);
    const nowDate = new Date(now);
    const midnight = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate() + 1, 0, 0, 0);
    const timeUntilMidnight = midnight - nowDate;

    setTimeout(() => {
        const loginData = {};
        saveLoginData(loginData);
        console.log('ログインデータをリセットしました。');

        // 次の0時に再度リセットをスケジュール
        resetLoginDataAtMidnight();
    }, timeUntilMidnight);
}

// JST定義
const j_timezone = {timeZone: 'Asia/Tokyo'};

client.on('ready', () => {
    console.log(`Ready${client.user.tag}`);
    setInterval(() => {
        client.user.setActivity({
            name: `${client.ws.ping}ms|Shibaken!|/help`
        })
    }, 5000)
    resetLoginDataAtMidnight();
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
});


client.on('messageCreate', message => {
    if (message.author.bot) return;
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
});

//BOTの起動 tokenは.envに記述しておく
client.login(token)