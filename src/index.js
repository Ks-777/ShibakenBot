require('dotenv').config();
const token = process.env.token;
const { Client, MessageEmbed, GatewayIntentBits, Events, Message } = require('discord.js');
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
client.on('ready', () => {
    console.log(`Ready${client.user.tag}`);
    setInterval(() => {
        client.user.setActivity({
            name: `${client.ws.ping}ms|Shibaken!|/help`
        })
    }, 10000)
});
// interactionCreateイベントリスナーでコマンドを最初に処理する
client.on(Events.InteractionCreate, async interaction => {

    // スラッシュコマンドが存在しない場合は何もしない(return)
    if (!interaction.isChatInputCommand()) return;

    // helpコマンドする処理
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
    },
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
}));
//BOTの起動 tokenは.envに記述しておく
client.login(token)