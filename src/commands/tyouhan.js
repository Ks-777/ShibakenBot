const { SlashCommandBuilder } = require('discord.js');
const token_unb = process.env.token_unb;
const https = require('https');

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

        async function syoukai() {
            const url = `https://unbelievaboat.com/api/v1/guilds/1250416661522153553/users/${userId}`;
            const options = {
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: `${token_unb}`
                },
            };

            return new Promise((resolve, reject) => {
                https.get(url, options, (res) => {
                    let data = '';

                    res.on('data', (chunk) => {
                        data += chunk;
                    });

                    res.on('end', () => {
                        try {
                            const json = JSON.parse(data);
                            if (kakekin_tyouhan >= json.total || Math.sign(json.total) <= 0) {
                                resolve(false);
                            } else {
                                resolve(true);
                            }
                        } catch (error) {
                            reject(error);
                        }
                    });
                }).on('error', (error) => {
                    reject(error);
                });
            });
        }

        const isValid = await syoukai();

        if (!isValid) {
            await interaction.reply({ content: `所持金が不足しています。掛け金を見直してください。` });
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
                }
            };
            const req = https.request(url, options, (res) => {
                res.on('data', (d) => {
                    process.stdout.write(d);
                });
            });
            req.on('error', (error) => {
                console.error('error:', error);
            });
            req.write(JSON.stringify({ cash: kakekin_tyouhan_mainasu }));
            req.end();
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
                }
            };
            const req = https.request(url, options, (res) => {
                res.on('data', (d) => {
                    process.stdout.write(d);
                });
            });
            req.on('error', (error) => {
                console.error('error:', error);
            });
            req.write(JSON.stringify({ cash: kakekin_tyouhan * 2 })); // 掛け金の2倍を付与
            req.end();
        }

        const randnum_th = randnum % 2 === 0 ? 0 : 1;

        if (randnum_th === 0) {
            if (tyou_han === '0') {
                await kake_fuyo();
                await interaction.reply({ content: `あなたは丁を選択し、サイコロは${randnum}(${randnum_1}+${randnum_2})(丁)が出たので成功しました！\n${kakekin_tyouhan}チーが二倍になって付与されました！` });
            } else {
                await interaction.reply({ content: `あなたは半を選択し、サイコロは${randnum}(${randnum_1}+${randnum_2})(丁)が出たので失敗しました。\n${kakekin_tyouhan}チーは没収されました。` });
            }
        } else {
            if (tyou_han === '1') {
                await kake_fuyo();
                await interaction.reply({ content: `あなたは半を選択し、サイコロは${randnum}(${randnum_1}+${randnum_2})(半)が出たので成功しました！\n${kakekin_tyouhan}チーが二倍になって付与されました！` });
            } else {
                await interaction.reply({ content: `あなたは丁を選択し、サイコロは${randnum}(${randnum_1}+${randnum_2})(半)が出たので失敗しました。\n${kakekin_tyouhan}チーは没収されました。` });
            }
        }
    }
};
