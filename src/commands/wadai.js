const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
// ☆wadai.txtに改行と各行の末尾に,をつければ話題を簡単に追加可能☆ ここからファイル読み込み&wadai定義処理
const wadaiFile = require('./database/wadai.txt');
fs.readFileSync('./text.txt', utf-8, (err, data) => {
    if(data) {
        const wadai_nokaigyo = data;
    } else {
        console.log(err);
    }
});
const wadai_nolist = wadai_nokaigyo.replace(/\n/g, '');
const wadai = wadai_nolist.split(',')
// ここまでがファイル読み込み&wadai定義処理

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wadai')
        .setDescription('話の話題をランダムに送信します。(50個以上) みんなの話題募集中!'),
    execute: async function(interaction) {
        const randnum = Math.floor(Math.random() * wadai.length);  // 0からwadai配列の長さ-1までの乱数を生成
        const select_wadai = wadai[randnum];  // 乱数に対応するwadaiの要素を選択
        await interaction.reply({ content: `# 話題：${select_wadai}` });
    },
};