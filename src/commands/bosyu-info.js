const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const bosyuFile = require('./bosyu.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bosyu-info')
		.setDescription('募集情報一覧または特定募集の情報を表示します')
		.addStringOption(option =>
			option.setName('id')
				.setDescription('募集ID（指定した場合はその募集のURLを返します）')
				.setRequired(false)
		),
	execute: async (interaction) => {const embed = new EmbedBuilder()
    .setColor('#9e9e9e')
    .setTitle('Embed Title')
    .setDescription('This is an example description for the Discord embed. You can add more text here to describe what the embed is about.')
    .setImage('https://via.placeholder.com/500x200')
    .setThumbnail('https://via.placeholder.com/80')
    .setFooter({ text: 'Footer Text', iconURL: 'https://via.placeholder.com/20' })
    .setTimestamp()
    .addFields({ name: 'Field 1', value: 'Content for field 1 goes here.' })
    .addFields({ name: 'Field 2', value: 'Content for field 2 goes here.' })

const button1 = new ButtonBuilder()
    .setLabel('Simple Button')
    .setStyle(ButtonStyle.Primary)

const button2 = new ButtonBuilder()
    .setLabel('Simple Button')
    .setStyle(ButtonStyle.Primary)

		const recruitmentId = interaction.options.getString('id');
		if (recruitmentId) {
			const recruitment = bosyuFile.getRecruitment(recruitmentId);
			if (!recruitment) {
				await interaction.reply({ content: '指定された募集IDの情報が存在しません。', ephemeral: true });
				return;
			}
			if (recruitment.publishInfo && recruitment.publishInfo.guildId) {
				const { guildId, channelId, messageId } = recruitment.publishInfo;
				const url = `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;
				await interaction.reply({ content: `募集ID【${recruitmentId}】のURL:\n${url}`, ephemeral: true });
			} else {
				await interaction.reply({ content: 'この募集はまだ公開されていません。', ephemeral: true });
			}
		} else {
			const allData = bosyuFile.getAllRecruitments();
			const fields = [];
			for (const id in allData) {
				const rec = allData[id];
				let urlText = "未公開";
				if (rec.publishInfo && rec.publishInfo.guildId) {
					const { guildId, channelId, messageId } = rec.publishInfo;
					urlText = `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;
				}
				fields.push({
					name: rec.title || "タイトル未設定",
					value: urlText || "未公開",
					inline: false
				});
			}
			const embed = new EmbedBuilder()
				.setTitle('現在の募集一覧')
				.addFields(fields)
				.setTimestamp();
			await interaction.reply({ embeds: [embed], ephemeral: true });
		}
	}
};
