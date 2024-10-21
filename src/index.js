require('dotenv').config();
const fs = require('fs');
const token = process.env.token;
const token_unb = process.env.token_unb;
const { Client, MessageEmbed, GatewayIntentBits, Events, Message , ChannelType} = require('discord.js');
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
var sentMessages = new Set(); // メッセージを送ったユーザーIDのセット
// コマンドファイル定義(処理用)
const helpFile = require('./commands/help.js');
const spaceFile = require('./commands/space.js');
const wadaiFile = require('./commands/wadai.js');
const memberFile = require('./commands/member.js');
// 初めてログイン検知時使用
const log_msgFile = 'log-msg.json';
// クールダウン用
const cooldowns = new Map();

var saveSentMessages = () => {
    fs.writeFileSync(log_msgFile, JSON.stringify(Array.from(sentMessages)));
};
// データをファイルから読み込む関数
const loadSentMessages = () => {
    if (fs.existsSync(log_msgFile)) {
        try {
            const data = fs.readFileSync(log_msgFile, 'utf8');
            if (data) {
                sentMessages = new Set(JSON.parse(data));
            }
        } catch (error) {
            console.error('Error reading or parsing sentMessages.json:', error);
            sentMessages = new Set(); // エラーが発生した場合、新しいセットを初期化
        }
    }    
};
client.on('ready', () => {
    console.log(`Ready${client.user.tag}`);
    setInterval(() => {
        client.user.setActivity({
            name: `${client.ws.ping}ms|Shibaken!|/help`
        })
    }, 10000)
    checkChannelMessages();
    loadSentMessages();
});
// interactionCreateイベントリスナーでコマンドを最初に処理する
client.on(Events.InteractionCreate, async interaction => {

    // スラッシュコマンドが存在しない場合は何もしない(return)
    if (!interaction.isChatInputCommand()) return;
    const now = Date.now();
    const userId = interaction.user.id;

    if (cooldowns.has(userId)) {
        const expirationTime = cooldowns.get(userId) + 5000; // 5秒のクールダウンタイム
        if (now < expirationTime) {
            return interaction.reply({ content: 'スラッシュコマンドを実行するにはもう少し時間をおいてください。', ephemeral: true });
        }
    }
    
    // helpコマンドする処理
    if (interaction.commandName === helpFile.data.name) {
        try {
            await helpFile.execute(interaction);
            setTimeout(() => cooldowns.delete(userId), 5000); // 5秒後にクールダウンを解除
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
            setTimeout(() => cooldowns.delete(userId), 5000); // 5秒後にクールダウンを解除
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
            setTimeout(() => cooldowns.delete(userId), 5000); // 5秒後にクールダウンを解除
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
            setTimeout(() => cooldowns.delete(userId), 5000); // 5秒後にクールダウンを解除
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
    if (message.author.bot) return;

    const userId = message.author.id;
    const today = new Date().toDateString();

    // ユーザーIDと日付を組み合わせたキーを作成
    const key = `${userId}-${today}`;

    if (!sentMessages.has(key)) {
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
        if (!sentMessages.has(key)) {
            sentMessages.add(key);
            message.reply({ content:`<@${userId}>さん、こんにちは！\n\`今日初めてのログインです。3000チーをプレゼント!\``, allowedMentions: { repliedUser: false }});
            saveSentMessages();
        }
}});
// 過疎通知
const CHANNEL_ID = '1250416661522153556'; //この機能を使用するサーバーで機能を適用したいチャンネルのID
const CHECK_INTERVAL = 10 * 1000; 
const NO_MESSAGE_INTERVAL_5_MIN = 5 * 60 * 1000;
const NO_MESSAGE_INTERVAL_10_MIN = 10 * 60 * 1000; 
const NO_MESSAGE_INTERVAL_1_HOUR = 60 * 60 * 1000; 

async function checkChannelMessages() {
    const channel = await client.channels.fetch(CHANNEL_ID);
    const messages = await channel.messages.fetch({ limit: 1 });
    const lastMessage = messages.first();
    const now = new Date();

    
    // 日本時間で夜1時以降朝6時未満の時はメッセージを送らない
    const japanOffset = 9 * 60 * 60 * 1000; // UTC+9時間
    const japanTime = new Date(now.getTime() + japanOffset);
    const hour = japanTime.getUTCHours();

    if (hour >= 24 || hour < 7) {
        // 日本時間で24時以降朝6時未満の時は処理を中断
        setTimeout(checkChannelMessages, CHECK_INTERVAL);
        return;
    }
    const lastMessageTimestamp = lastMessage ? lastMessage.createdTimestamp : 0;
    
    if (now - lastMessageTimestamp > NO_MESSAGE_INTERVAL_1_HOUR) {
        await channel.send('\`1時間メッセージがありませんでした\`\n\n# 圧　倒　的　過　疎\n</wadai:1296469890227507283>で話題を生成して会話しよう');
    } else if (now - lastMessageTimestamp > NO_MESSAGE_INTERVAL_10_MIN) {
        await channel.send('\`10分メッセージがありませんでした\`\n## 過密しよ\n</wadai:1296469890227507283>で話題を生成して会話しよう');
    } else if (now - lastMessageTimestamp > NO_MESSAGE_INTERVAL_5_MIN) {
        await channel.send('**過疎**\n</wadai:1296469890227507283>で話題を生成して会話しよう');
    }

    setTimeout(checkChannelMessages, CHECK_INTERVAL
    )
};
//BOTの起動 tokenは.envに記述しておく
client.login(token)