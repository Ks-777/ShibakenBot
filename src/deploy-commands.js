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
    new SlashCommandBuilder()
        .setName('member')
        .setDescription('メンバー人数のソテー BOTの数を添えて')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('news')
        .setDescription('ニュースや天気を表示します')
        .addStringOption(option =>
			option.setName('tenki_choice')
				.setDescription('送信する情報を選択')
				.setRequired(true)
				.addChoices(
					{ name: '総合(メイン)', value: 'top' },
					{ name: '経済', value: 'business' },
					{ name: '政治', value: 'domestic' },
                    { name: 'IT(ICT)', value: 'it' },
                    { name: 'エンタメ', value: 'entertainment' },
                    { name: '科学', value: 'science' },
                    { name: '国際', value: 'world' },
                ))
        .toJSON(),
    new SlashCommandBuilder()
        .setName('tyouhan')
        .setDescription('ソロ丁半ゲームをします')
		.addIntegerOption(option =>
			option.setName('kakekin_tyouhan')
                .setRequired(true)
				.setDescription('掛け金(チー)を入力してください(カンマなし･数字のみ)'))
        .addStringOption(option =>
            option.setName('tyou_han')
                .setDescription('偶数(丁) or 奇数(半)')
                .setRequired(true)
                .addChoices(
                    { name: '丁', value: '0' },
                    { name: '半', value: '1' },
                ))
        .toJSON(),
    new SlashCommandBuilder()
        .setName('verify')
        .setDescription('認証を開始')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('embed')
        .addAttachmentOption(option => 
            option.setName('embedfile')
            .setDescription('JSON又はEmbedBuilderで作成したconst部分と最初の{}を除いたjsファイルを添付してください')
            .setRequired(true))
        .setDescription('【管理者用】カスタムEmbedを送信します')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('bosyu')
        .setDescription('募集を開始します')
        .addIntegerOption(option =>
            option.setName('b_num')
                .setDescription('募集人数を入力してください (無制限の場合は0)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('b_title')
                .setDescription('ゲーム名または募集タイトルを入力してください')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('募集モードを選択してください')
                .setRequired(true)
                .addChoices(
                    { name: '即時募集', value: 'immediate' },
                    { name: '予約募集', value: 'reservation' }
                )
        )
        .toJSON(),
    new SlashCommandBuilder()
        .setName('bosyu-info')
        .setDescription('募集情報一覧または特定募集の情報を表示します')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('募集ID（指定した場合はその募集のURLを返します）')
                .setRequired(false)
        )
        .toJSON(),
    new SlashCommandBuilder()
        .setName('pin')
        .setDescription('【ADMIN ONLY】SHIBAPIN - ShibakenBOT')
        .addStringOption(option =>
            option.setName('pin_choice')
                .setDescription('【ADMIN ONLY】Please choose PIN type')
                .setRequired(true)
                .addChoices(
                    { name: 'Unlock', value: 'unlock' },
                    { name: 'VERIFy', value: 'verify' },
                    { name: 'NOrmAL', value: 'normal' },
                    { name: 'TExT', value: 'text' },
                    { name: 'Ex', value: 'ex' },
                )
        )
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
