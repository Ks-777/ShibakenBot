const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
const yn = require('latest-yahoo-news');

module.exports = {
    data: new SlashCommandBuilder()
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
                )),
    execute: async function(interaction) {
        const choice = interaction.options.getString('tenki_choice');
        await interaction.deferReply({ ephemeral: true }); // 応答を一時停止し、非表示で設定
        try {
            const news_t = await yn(choice); // 非同期でニュースを取得
            if (!news_t.success) {
                return interaction.editReply({ content: 'エラーが発生しました。', ephemeral: true }); // 非表示で応答
            }
            const newsEmbed = new EmbedBuilder()
                .setTitle(`ニュースお知らせ(${choice})`)
                .setDescription(`<t:${Math.floor(Date.now() / 1000)}:F> 現在のニュースをお知らせします。`)
                .setColor(Colors.Green);
            
            news_t.news.forEach(newsItem => {
                newsEmbed.addFields(
                    { name: `${newsItem.title}(URL:${newsItem.link})`, value: newsItem.description, inline: true }
                );
            });
            return interaction.editReply({ embeds: [newsEmbed], ephemeral: true }); // 非表示で応答
        } catch (error) {
            console.error('エラー:', error);
            return interaction.editReply({ content: 'ニュースの取得中にエラーが発生しました。', ephemeral: true }); // 非表示で応答
        }
    }
};
