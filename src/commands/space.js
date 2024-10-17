const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('space')
        .setDescription('すべての文字の間にスペースを入れて主張します')
		.addStringOption(option =>
			option.setName('text')
                .setRequired(true)
				.setDescription('文字を間に入れたい文字列を入力'))
        .addStringOption(option =>
			option.setName('space_choice')
				.setDescription('間に入れる文字を半角･全角･絵文字星･☆から選択できます。')
				.setRequired(true)
				.addChoices(
					{ name: '全角空白', value: '　' },
					{ name: '半角空白', value: ' ' },
					{ name: '星(絵文字)', value: ':star:' },
                    { name: '星(☆)', value: '☆' },))
        .addStringOption(option =>
			option.setName('title')
				.setDescription('タイトルはお付けしますか？')
				.addChoices(
					{ name: 'タイトル(h1)', value: '#' },
					{ name: 'タイトル(h2)', value: '##' },
					{ name: 'タイトル(h3)', value: '###' },
				)),
        execute: async function(interaction) {
            const title = interaction.options.getString('title')
            const text = interaction.options.getString('text');
            const intext = interaction.options.getString('space_choice');
            const editedtext = text.split('').join(intext);
            const editedtext_2 = `\`\`\`${title} ${editedtext}\`\`\``;
            await interaction.reply({ content: `${editedtext_2}`, ephemeral: true });
    },
};