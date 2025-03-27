const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('認証を開始'),
    async execute(interaction) {
        const roleId = '1250418409854730263';
        const fetchedMember = await interaction.guild.members.fetch(interaction.member.id);

        const verifyButton = new ButtonBuilder()
            .setCustomId('verify')
            .setLabel('認証を開始(DMに送信)')
            .setStyle(ButtonStyle.Success)
            .setEmoji('✅');
        const row = new ActionRowBuilder().addComponents(verifyButton);

        if (fetchedMember.roles.cache.has(roleId)) {
            if (fetchedMember.id === "1223810206333407234") {
                await interaction.reply({
                    content: `デバックモードが起動しました。管理者様(ID:1223810206333407234)こんにちは。`,
                    components: [row],
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: `既に認証されているため、デバックモードを発動できません。`,
                    ephemeral: true
                });
            }
            return;
        }

        await interaction.reply({
            content: `DMにBOTから認証を開始するためのメッセージを再送しました。`,
            components: [row],
            ephemeral: true
        });
    }
};
