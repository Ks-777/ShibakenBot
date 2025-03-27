const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
// 話題リスト更新
const wadais = [
    { title: '今日(昨日)の夜ご飯何食べた？', desc: '写真があったら張ってね(反射注意)(飯テロ)(何も食べてないときは最新の夜ご飯を言ってください)' },
    { title: '今日(昨日)一番印象に残ったこと', desc: 'ないなら今日したこと' },
    { title: '最近行ったおすすめの場所', desc: 'ないなら家で何してたか' },
    { title: '今日(昨日)勉強した？', desc: '勉強してない？何やってるんですか！勉強してください！' },
    { title: '今日(昨日)1番びっくりしたこと', desc: '' },
    { title: '今日(昨日)1番笑ったこと', desc: '' },
    { title: '今日(昨日)一番嬉しかったことは？', desc: '何があったか詳しく教えてください' },
    { title: '今日(昨日)の朝ご飯は何だった？', desc: '写真があれば見せてね' },
    { title: '最近観た映画やドラマは？', desc: '感想も教えてください' },
    { title: '今日(昨日)の運動やスポーツは？', desc: '何をしたか教えてください' },
    { title: '最近ハマっている趣味やゲームは？', desc: 'どんなところが楽しいか教えてください' },
    { title: '今日(昨日)一番驚いた(興味深い)ニュースは？', desc: 'ニュースの内容も教えてください' },
    { title: '最近やってみた新しいことは？', desc: '感想も教えてください' },
    { title: '今日(昨日)何を食べた？', desc: '写真があれば見せてね' },
    { title: '今日(昨日)の通勤・通学中にあった面白い出来事は？', desc: '詳細も教えてください' },
    { title: '最近買ってよかったものは？', desc: 'ないなら買ったものなんでも紹介' }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wadai')
        .setDescription('話の話題をランダムに送信します。みんなの話題募集中!'),
    execute: async function(interaction) {
        const randomPair = wadais[Math.floor(Math.random() * wadais.length)];
        const title = randomPair.title;
        const desc = randomPair.desc;
        const embed = new EmbedBuilder()
            .setAuthor({ name: 'WADAI - Shibaken' })
            .setTitle(`話題:${title}`)
            .setDescription('ランダム送信 - 再送信：</wadai:1296469890227507283>')
            .setColor('Green')
            .setFields({ name: '補足等', value: desc })
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    },
};
