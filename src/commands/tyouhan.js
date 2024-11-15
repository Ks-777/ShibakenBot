const { SlashCommandBuilder, Colors } = require('discord.js');
const token_unb = process.env.token_unb;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tyouhan')
        .setDescription('ソロ丁半ゲームをします')
        .addIntegerOption(option =>
            option.setName('kakekin_tyouhan')
                .setRequired(true)
                .setDescription('掛け金(チー)を入力してください(カンマなし･数字のみ)'))
        .addStringOption(option =>
            option.setName('tyou_han')
                .setRequired(true)
                .setDescription('偶数(丁) or 奇数(半)')
                .addChoices(
                    { name: '丁', value: '0' },
                    { name: '半', value: '1' }
                )),
    
    execute: async function(interaction) {
        if (interaction.guild.id !== '1250416661522153553') return;

        const kakekin_tyouhan = interaction.options.getInteger('kakekin_tyouhan');
        const tyou_han = interaction.options.getString('tyou_han');
        const randnum_1 = Math.floor(Math.random() * 6) + 1;
        const randnum_2 = Math.floor(Math.random() * 6) + 1;
        const randnum = randnum_1 + randnum_2;
        const userId = interaction.user.id;
        const userTag = interaction.user.tag;
        const url = 'https://unbelievaboat.com/api/v1/guilds/1250416661522153553/users/1223810206333407234';
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: token_unb
            }
        };
        
        // fetchメソッドを使用
        const response = await fetch(url, options);
        const data = await response.json();
        const userCash = data.cash;

        console.log(`${userId} has ${userCash}`);

        if (userCash <= kakekin_tyouhan) {
            await interaction.reply({ content: `エラー:\nあなたは、${userCash}チー持っていますが、\n${kakekin_tyouhan}よりも等しいか少ないです。(チーが足りません)`, ephemeral: true });
            return;
        }

        function kake_remove() {
            const url = `https://unbelievaboat.com/api/v1/guilds/1250416661522153553/users/${userId}`;
            const kakekin_tyouhan_mainasu = -1 * kakekin_tyouhan;
            const options = {
                method: 'PATCH',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `${token_unb}`
                },
                body: JSON.stringify({ cash: kakekin_tyouhan_mainasu })
            };
            fetch(url, options)
                .then(res => res.json())
                .then(json => console.log(json))
                .catch(err => console.error('error:' + err));
        }
        
        kake_remove();

        function kake_fuyo() {
            const url = `https://unbelievaboat.com/api/v1/guilds/1250416661522153553/users/${userId}`;
            const options = {
                method: 'PATCH',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `${token_unb}`
                },
                body: JSON.stringify({ cash: kakekin_tyouhan * 2 }) // 掛け金の2倍を付与
            };
            fetch(url, options)
                .then(res => res.json())
                .then(json => console.log(json))
                .catch(err => console.error('error:' + err));
        }

        const randnum_th = randnum % 2 === 0 ? 0 : 1;
        const kakekin_tyouhan_2bai = kakekin_tyouhan * 2;
        if (randnum_th === 0) {
            if (tyou_han === '0') {
                await kake_fuyo();
                await interaction.reply({embeds:[{
                    color: Colors.Green,
                    author:{
                        name: userTag,
                    },
                    title: "勝ったぜ。(丁-丁)",
                    description: `あなたは丁を選択し、サイコロで${randnum} (${randnum_1}+${randnum_2})が出て「丁」(偶数)だったため、\n${kakekin_tyouhan_2bai}(実際増えたのは${kakekin_tyouhan})増えました。`
                }],
                });
            } else {
                await interaction.reply({embeds:[{
                    color: Colors.Red,
                    author:{
                        name: userTag,
                    },
                    title: "負けちゃった...(半-丁)",
                    description: `あなたは半を選択し、サイコロで${randnum} (${randnum_1}+${randnum_2})が出て「丁」(偶数)だったため、\n${kakekin_tyouhan}ﾁｰ負けました。`
                }],
                });
            }
        } else {
            if (tyou_han === '1') {
                await kake_fuyo();
                await interaction.reply({embeds:[{
                    color: Colors.Green,
                    author:{
                        name: userTag,
                    },
                    title: "勝ったぜ。(半-半)",
                    description: `あなたは半を選択し、サイコロで${randnum} (${randnum_1}+${randnum_2})が出て「半」(奇数)だったため、\n${kakekin_tyouhan_2bai}(実際増えたのは${kakekin_tyouhan})増えました。`
                }],
                });
            } else {
                await interaction.reply({embeds:[{
                    color: Colors.Red,
                    author:{
                        name: userTag,
                    },
                    title: "負けちゃった...(丁-半)",
                    description: `あなたは丁を選択し、サイコロで${randnum} (${randnum_1}+${randnum_2})が出て「半」(奇数)だったため、\n${kakekin_tyouhan}ﾁｰ負けました。`
                }],
                });
        }
    }
},}
