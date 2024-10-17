require('dotenv').config();
const token = process.env.token;
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST, Routes } = require('discord.js');
const rest = new REST({ version: '10' }).setToken(token);
const commands = [
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('BOTのコマンド一覧を送信')
        .toJSON(),
    new SlashCommandBuilder()
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
                    { name: '星(☆)', value: '☆' },
                ))
        .addStringOption(option =>
			option.setName('title')
				.setDescription('タイトルはお付けしますか？')
				.addChoices(
					{ name: 'タイトル(h1)', value: '#' },
					{ name: 'タイトル(h2)', value: '##' },
					{ name: 'タイトル(h3)', value: '###' },
				))
                .toJSON(),
    new SlashCommandBuilder()
        .setName('wadai')
        .setDescription('話の話題をランダムに送信します。(50個以上) みんなの話題募集中!')
        .toJSON(),
];
async function main() {
    try {
        await rest.put(
            Routes.applicationCommands('1251167658167111691'),
            { body: commands }
        );
        console.log('Successfully registered application commands.');
    } catch (error) {
        console.error('Error registering application commands:', error);
    }
}

main();
