const { SlashCommandBuilder, Interaction, Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents:[
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences
    ]});
module.exports = {
    data: new SlashCommandBuilder()
        .setName('member')
        .setDescription('メンバー人数のソテー BOTの数を添えて'),
    execute: async function(interaction) {
        const members = await interaction.guild.members.fetch();
        const bot_member_count = interaction.guild.memberCount;
        const bot = members.filter(member=>member.user.bot);
        const bot_size = bot.size;
        const member_count = bot_member_count - bot_size; 
        const member_msg = `**メンバー合計：**${member_count}**人 | BOT合わせて**：${bot_member_count}**人 | 内BOT**${bot_size}**人?**`
        await interaction.reply({ content: `${member_msg}`});
    },
};