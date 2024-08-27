//いつもの
const { SlashCommandBuilder } = require('discord.js');

//embedを先に定義
const helpembed = {
	color: 0x03a8f4,
	title: 'BOTコマンドリスト',
	author: {
		name: 'CreateByKS|Thanks: AllUsers!',
	},
	description: 'コマンドは基本的にスラッシュコマンドです。',
	thumbnail: {
	},
	fields: [
		{
			name: '/help',
			value: 'BOTのコマンドの一覧を表示します。',
		},
		{
			name: '/ping',
			value: 'pingを表示',
			inline: true,
		},
		{
			name: 'fxtwitter、fixuptwitter',
            value: 'twitter.com、x.comなどのURLをいい感じに展開してあげます',
            inline: false,
		},
	],
	timestamp: new Date().toISOString(),
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('BOTのコマンド一覧を送信'),
    execute: async function(interaction) {
        await interaction.reply({ embeds: [helpembed] });
    },
};