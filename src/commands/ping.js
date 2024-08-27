//いつもの
const { SlashCommandBuilder} = require('discord.js');
const { GatewayIntentBits, Client } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.GuildPresences,
    ]});
module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pong!',),
    execute: async function(interaction) {
        await interaction.reply(`${client.ws.ping} ms`);
    }
};