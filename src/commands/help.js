const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('BOTのコマンド一覧を送信'),
    execute: async function(interaction) {
		const helpEmbed = new EmbedBuilder()
			.setColor(0x03a8f4)
			.setTitle('BOT機能/コマンドリスト')
			.setAuthor({ name: 'CreateByKS|Thanks: AllUsers!' })
			.setDescription('コマンドは基本的にスラッシュコマンドです。')
			.addFields(
			//更新用メモ: 1行目はinlineを記述しないでfalse扱いとし、2行目のみtrueとしこれを繰り返す
			{ name: '/help', value: 'BOTのコマンドの一覧を表示します。' },
			{ name: '/space', value: 'すべての文字の間にスペースを入れて主張します' },
			{ name: '/verify', value: '認証を開始します', inline: true },
			{ name: '/member', value: 'サーバーのメンバー数を表示します' },
			{ name: '/news', value: '最新のニュースを表示します', inline: true },
			{ name: '/wadai', value: '話のネタ(お題)をランダムで表示します' },
			{ name: '/embed', value: '【管理者限定】カスタムEmbedを送信します', inline: true },
			{ name: '/tyouhan', value: 'カジノマネーと連携した丁半ゲームをプレイします' },
			{ name: 'fxtwitter、fixuptwitter', value: 'twitter.com、x.comなどのURLをいい感じに展開してあげます' },
			{ name: '自動返信', value: '特定の単語を含むメッセージに対して自動で返信します', inline: true },
			)
			.setTimestamp(new Date());

        await interaction.reply({ embeds: [helpEmbed] });
    },
};