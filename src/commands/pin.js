const { SlashCommandBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const PIN_DATA_PATH = path.join(process.cwd(), 'pinData.json');

// 永続化用関数
function loadPinData() {
	// pinData.jsonが存在しなければ空のオブジェクトを返す
	if (!fs.existsSync(PIN_DATA_PATH)) return {};
	try {
		return JSON.parse(fs.readFileSync(PIN_DATA_PATH, 'utf8'));
	} catch (e) {
		console.error('pinData.json parse error:', e);
		return {};
	}
}
function savePinData(data) {
	fs.writeFileSync(PIN_DATA_PATH, JSON.stringify(data, null, 2));
}
let pinData = loadPinData();

// 新規追加: ピン更新用関数
async function refreshPin(channel, config) {
	try {
		const messages = await channel.messages.fetch({ limit: 1 });
		const latest = messages.first();
		if (!latest || latest.id !== config.pinnedMessageId) {
			try {
				const oldMsg = await channel.messages.fetch(config.pinnedMessageId);
				if (oldMsg) await oldMsg.delete();
			} catch (_) { }
			let sent;
			if (config.mode === 'text') {
				sent = await channel.send(config.content);
			} else {
				const payload = { embeds: [config.content] };
				// 変更: 保存されたcomponentsがあれば付与
				if (config.components) payload.components = config.components;
				sent = await channel.send(payload);
			}
			config.pinnedMessageId = sent.id;
			pinData[channel.id] = config;
			savePinData(pinData);
		}
	} catch (error) {
		console.error("refreshPin error:", error);
	}
}

// 固定状態の監視関数（各チャネルごとに setInterval で実行）を見直し
async function startPinMonitor(channel, config) {
	// 監視間隔（例: 12秒）
	const interval = 12 * 1000;
	config.intervalId = setInterval(() => {
		refreshPin(channel, config);
	}, interval);
	// ★ 新規追加: 他ユーザーのメッセージ送信時に即座に固定メッセージをリセットするリスナー
	if (!config.listenerAdded) {
		const client = channel.client || channel.guild.client;
		client.on('messageCreate', async (msg) => {
			try {
				if (msg.channel.id === channel.id && !msg.author.bot) {
					refreshPin(channel, config);
				}
			} catch (error) {
				console.error("messageCreate listener error:", error);
			}
		});
		config.listenerAdded = true;
	}
}

// 修正: 固定解除時に対象エントリーを存在するなら必ず削除するよう修正
async function stopPinMonitor(channelId) {
	if (pinData[channelId]) {
		if (pinData[channelId].intervalId) clearInterval(pinData[channelId].intervalId);
		delete pinData[channelId];
		savePinData(pinData);
	}
}

module.exports = {
	data: new SlashCommandBuilder()
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
		),
	execute: async function(interaction) {
		if (!interaction.member.permissions.has('ADMINISTRATOR')) {
			return await interaction.reply({ content: 'オマエ、カンリシャ、ジャナイ', ephemeral: true });
		}
		const pinChoice = interaction.options.getString('pin_choice');
		const ch = await interaction.guild.channels.fetch(interaction.channelId);
		if (pinChoice === 'unlock') {
			// 解除：監視停止＆固定解除
			await stopPinMonitor(ch.id);
			await interaction.reply({ content: '固定解除しました。', ephemeral: true });
			return;
		}
		// モード別処理
		if (pinChoice === 'verify') {
			// 固定用 vfembed & vfrow を設定
			const vfembed = new EmbedBuilder()
				.setAuthor({ name: 'SHIBAPIN - ShibakenBOT' })
				.setTitle('認証総合へようこそ')
				.setDescription('認証方法はこちらをご確認ください。')
				.addFields(
					{ name: 'DMが来ていない|認証に失敗した|認証をやり直したい', value: 'メッセージ下部のボタンから再送信できます。\n\n**誤作動の原因となるので再送信の不要な押下はおやめください。**' },
					{ name: '認証に失敗する', value: '画像にある文字列が本当にそうなのかお確かめください。' },
					{ name: 'それでも認証が出来ない', value: 'ヘルプを受けましょう！このチャンネルでは質問やヘルプを求める、更には手動認証の申請ができます。\n\n**__ただし、頼む際はルールに同意してる旨を伝えてください(例：「認証が出来ないので手動認証お願いします(ルールに同意することを誓います)」)__**' }
				)
				.setColor('Green')
				.setTimestamp();
			const vfbutton = new ButtonBuilder()
				.setCustomId('verify')
				.setLabel('認証を開始')
				.setStyle(ButtonStyle.Success); // 修正: ButtonStyle 使用
			const rulebutton = new ButtonBuilder()
				.setLabel('ルールを見る')
				.setURL('https://discord.com/channels/1250416661522153553/1250416826513358951/1335436785177723002')
				.setStyle(ButtonStyle.Link); // 修正: ButtonStyle 使用
			const vfrow = new ActionRowBuilder().addComponents(vfbutton, rulebutton);
			const sentMsg = await ch.send({ embeds: [vfembed], components: [vfrow] });
				// 変更: componentsも保存
			const config = { mode: 'verify', content: vfembed, pinnedMessageId: sentMsg.id, components: [vfrow] };
			pinData[ch.id] = config;
			savePinData(pinData);
			startPinMonitor(ch, config);
			return await interaction.reply({ content: '認証固定モードを開始しました。', ephemeral: true });
		}
		// normalの場合はモーダルでJSON形式のEmbed取得
		else if (pinChoice === 'normal') {
			// モーダル表示（既存の normal modal を使用）
			const nlmodal = new ModalBuilder()
				.setCustomId('pin_normal')
				.setTitle('PIN - NOrmAL');
			const nlembedFieldInput = new TextInputBuilder()
				.setCustomId('embed_nl_input')
				.setLabel('JSON形式で入力')
				.setStyle(TextInputStyle.Paragraph)
				.setRequired(true);
			const nlactionRow = new ActionRowBuilder().addComponents(nlembedFieldInput);
			nlmodal.addComponents(nlactionRow);
			return interaction.showModal(nlmodal);
		}
		else if (pinChoice === 'text') {
			// textモード用モーダル（複数行入力）を表示
			const textModal = new ModalBuilder()
				.setCustomId('pin_text')
				.setTitle('PIN - TExT');
			const textInput = new TextInputBuilder()
				.setCustomId('text_input')
				.setLabel('固定するテキスト（複数行可）')
				.setStyle(TextInputStyle.Paragraph)
				.setRequired(true);
			const row = new ActionRowBuilder().addComponents(textInput);
			textModal.addComponents(row);
			return interaction.showModal(textModal);
		}
		else if (pinChoice === 'ex') {
			return interaction.reply({ content: '未実装', ephemeral: true });
		}
	},
	// normalモーダル送信後の処理
	async handleNormalModalSubmit(interaction) {
		const input = interaction.fields.getTextInputValue('embed_nl_input');
		try {
			const embedData = JSON.parse(input);
			const embed = new EmbedBuilder(embedData);
			const ch = await interaction.guild.channels.fetch(interaction.channelId);
			const sentMsg = await ch.send({ embeds: [embed] });
			const config = { mode: 'normal', content: embed, pinnedMessageId: sentMsg.id };
			pinData[ch.id] = config;
			savePinData(pinData);
			startPinMonitor(ch, config);
			return interaction.reply({ content: 'normal固定モードを開始しました。', ephemeral: true });
		} catch (error) {
			return interaction.reply({ content: 'JSON形式が正しくありません。', ephemeral: true });
		}
	},
	// textモーダル送信後の処理
	async handleTextModalSubmit(interaction) {
		const input = interaction.fields.getTextInputValue('text_input');
		const ch = await interaction.guild.channels.fetch(interaction.channelId);
		const sentMsg = await ch.send(input);
		const config = { mode: 'text', content: input, pinnedMessageId: sentMsg.id };
		pinData[ch.id] = config;
		savePinData(pinData);
		startPinMonitor(ch, config);
		return interaction.reply({ content: 'text固定モードを開始しました。', ephemeral: true });
	},
};