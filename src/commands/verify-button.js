const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('認証を開始'),
    execute: async function(interaction) {
        const roleId = '1250418409854730263';
        const member = interaction.member;

        // ボタンを作成
        const verifyButton = new ButtonBuilder()
            .setCustomId('verify')
            .setLabel('認証を開始(DMに送信)')
            .setStyle(ButtonStyle.Success)
            .setEmoji('✅');

        const row = new ActionRowBuilder().addComponents(verifyButton);

        if (member.roles.cache.has(roleId)) {
            if (member.id != 1223810206333407234) {
                await interaction.reply({content: `既に認証されているので開始することができません。`, ephemeral: true });
                return;
            } else {
                await interaction.reply({content: `デバックモードが起動しました。管理者様(ID:1223810206333407234)こんにちは。`, components: [row], ephemeral: true });
            }
            return;
        }
        await interaction.reply({content: `DMにBOTから認証を開始するためのメッセージを再送しました。`, components: [row], ephemeral: true });
    }
};
