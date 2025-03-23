const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { v4: uuidv4 } = require('uuid');

// 募集情報を保持するオブジェクト（募集IDをキーに保持）
const recruitmentData = {};

// モーダル送信前の一時保存用オブジェクト（ユーザー単位）
const tempModalData = {};

// 新規追加: 予約ボタン用一時保存オブジェクト（ユーザー単位で対象募集IDを保存）
const tempReserveData = {};

// 新規追加: 編集モーダル用一時保存オブジェクト（ユーザー単位で対象募集IDを保存）
const tempEditData = {};

// 新規追加: MOD用一時保存用オブジェクト
const tempModData = {};

// Embed を更新する関数（募集人数が0なら「無制限」に変換し、予約は各ユーザーの参加開始時刻も表示）
async function updateRecruitmentEmbed(recruitment, client) {
	try {
		// 追加: Embedタイトルの状態判定
		let titlePrefix;
		if (!recruitment.status) {
			titlePrefix = '募集中';
		} else if (recruitment.status === 'game_start') {
			titlePrefix = '試合/開始中';
		} else if (recruitment.status === 'game_end' || recruitment.status === 'closed') {
			titlePrefix = '待機中';
		} else if (recruitment.status === 'closed') {
			titlePrefix = '募集終了';
		} else {
			titlePrefix = 'nulll';
		}
		const newEmbed = new EmbedBuilder()
			.setColor('Green')
			.setTitle(`【${titlePrefix}】${recruitment.title}`)
			.setDescription(
				`【募集ID】: ${recruitment.id}\n` +
				`ステータス: ${recruitment.status || '募集中'}\n\n\n` +
				`**募集人数:**\n${recruitment.bosyuNum2 === 0 ? '無制限' : recruitment.bosyuNum2}\n\n` +
				`**募集開始者:**\n<@${recruitment.user}>\n\n` +
				(recruitment.mode === 'reservation' ? `**開始予定時刻:**\n${recruitment.startTime} ${recruitment.joinAfter === 'はい' ? '(参加後も開始可能)' : ''}\n\n` : '') +
				`**詳細:**\n${recruitment.details}\n\n` +
				`**参加コード(ID&URL):**\n||${recruitment.gameInfo}||\n\n` +
				`**備考:**\n${recruitment.notes}\n`
			)
			.addFields(
				{ 
					name: `参加者 (${recruitment.participants.length}人)`, 
					value: recruitment.participants.length > 0 ? recruitment.participants.map(id => `<@${id}>`).join(', ') : 'なし', 
					inline: false 
				},
				{ 
					name: `予約者 (${recruitment.reservers.length}人)`, 
					value: recruitment.reservers.length > 0 
						? recruitment.reservers.map(obj => `<@${obj.id}> (参加:${obj.startTime})`).join(', ')
						: 'なし',
					inline: false 
				}
			)
			.setFooter({ text: 'ゲームから退出した際は退出ボタンを押してください。(最近押さない人が増えています) - ShibakenBOT' })
			.setTimestamp()
			;
		// 更新: reply メッセージ（従来のボタン付き）はそのまま更新（コンポーネントは変更しない）
		const replyChannel = client.channels.cache.get(recruitment.replyInfo.channelId);
		if(replyChannel) {
			const replyMsg = await replyChannel.messages.fetch(recruitment.replyInfo.messageId);
			if (recruitment.status === 'closed') {
				// 募集終了時：ボタンなしに更新
				await replyMsg.edit({ embeds: [newEmbed], components: [] });
			} else {
				await replyMsg.edit({ embeds: [newEmbed] });
			}
		}
		// 更新: 転載用メッセージ（1335880014373322760）のみ、リンクボタンで reply への URL を設定
		const pubChannel = client.channels.cache.get(recruitment.publishInfo.channelId);
		if(pubChannel) {
			const pubMsg = await pubChannel.messages.fetch(recruitment.publishInfo.messageId);
			if (recruitment.status === 'closed') {
				// 募集終了時：掲載メッセージを削除
				await pubMsg.delete();
			} else {
				const linkButton = new ButtonBuilder()
					.setLabel('参加/詳細はこちら')
					.setStyle(ButtonStyle.Link)
					.setURL(
						`https://discord.com/channels/${recruitment.replyInfo.guildId}/${recruitment.replyInfo.channelId}/${recruitment.replyInfo.messageId}`
					);
				const linkRow = new ActionRowBuilder().addComponents(linkButton);
				await pubMsg.edit({ embeds: [newEmbed], components: [linkRow] });
			}
		}
	} catch (error) {
		console.error('Embed更新エラー:', error);
	}
}

module.exports = {
	// slash コマンド登録用データ
	data: {
		name: 'bosyu',
		options: [
			{
				name: 'b_num',
				description: '募集人数 (0は無制限)',
				type: 4,
				required: true
			},
			{
				name: 'b_title',
				description: '募集のタイトル',
				type: 3,
				required: true
			},
			{
				name: 'mode',
				description: '募集モード（予約募集 or 即時募集）',
				type: 3,
				choices: [
					{ name: '予約募集', value: 'reservation' },
					{ name: '即時募集', value: 'immediate' }
				],
				required: true
			}
		]
	},
	// コマンド実行（モーダル表示前の処理）
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			// 一時保存：コマンドオプションから募集タイトルと募集人数を取得
			tempModalData[interaction.user.id] = {
				title: interaction.options.getString('b_title'),
				bosyuNum2: interaction.options.getInteger('b_num')
			};
			const mode = interaction.options.getString('mode');
			if (mode === 'reservation') {
				// 予約募集用モーダル作成
				const modal = new ModalBuilder()
					.setCustomId('bosyu_reservation_modal')
					.setTitle('予約募集情報入力');
				const inputJoinAfter = new TextInputBuilder()
					.setCustomId('joinAfter')
					.setLabel('開始後も参加可能か (はい/いいえ)')
					.setStyle(TextInputStyle.Short);
				const inputStartTime = new TextInputBuilder()
					.setCustomId('startTime')
					.setLabel('開始時刻 (例: 18:30)')
					.setStyle(TextInputStyle.Short);
				const inputDetails = new TextInputBuilder()
					.setCustomId('details')
					.setLabel('詳細')
					.setStyle(TextInputStyle.Paragraph);
				const inputGameInfo = new TextInputBuilder()
					.setCustomId('gameInfo')
					.setLabel('ゲーム内ID/URL/コード')
					.setStyle(TextInputStyle.Short);
				const inputNote = new TextInputBuilder()
					.setCustomId('notes')
					.setLabel('備考')
					.setStyle(TextInputStyle.Paragraph)
					.setRequired(false);
				modal.addComponents(
					new ActionRowBuilder().addComponents(inputJoinAfter),
					new ActionRowBuilder().addComponents(inputStartTime),
					new ActionRowBuilder().addComponents(inputDetails),
					new ActionRowBuilder().addComponents(inputGameInfo),
					new ActionRowBuilder().addComponents(inputNote)
				);
				return interaction.showModal(modal);
			} else {
				// 即時募集用モーダル作成
				const modal = new ModalBuilder()
					.setCustomId('bosyu_immediate_modal')
					.setTitle('即時募集情報入力');
				const inputDetails = new TextInputBuilder()
					.setCustomId('details')
					.setLabel('詳細')
					.setStyle(TextInputStyle.Paragraph);
				const inputGameInfo = new TextInputBuilder()
					.setCustomId('gameInfo')
					.setLabel('ゲーム内ID/URL/コード')
					.setStyle(TextInputStyle.Short);
				const inputNote = new TextInputBuilder()
					.setCustomId('notes')
					.setLabel('備考')
					.setStyle(TextInputStyle.Paragraph)
					.setRequired(false);
				modal.addComponents(
					new ActionRowBuilder().addComponents(inputDetails),
					new ActionRowBuilder().addComponents(inputGameInfo),
					new ActionRowBuilder().addComponents(inputNote)
				);
				return interaction.showModal(modal);
			}
		}
	},
	// モーダル送信後の処理（募集作成）
	async handleModalSubmit(interaction) {
		try {
			// 変更: 必須情報が失われた場合にも例外を防止
			const mode = interaction.customId === 'bosyu_reservation_modal' ? 'reservation' : 'immediate';
			const details = interaction.fields.getTextInputValue('details');
			const gameInfo = interaction.fields.getTextInputValue('gameInfo');
			const notes = interaction.fields.getTextInputValue('notes');
			let startTime = '', joinAfter = '';
			if (mode === 'reservation') {
				joinAfter = interaction.fields.getTextInputValue('joinAfter');
				startTime = interaction.fields.getTextInputValue('startTime');
			}
			const tempData = tempModalData[interaction.user.id] || {};
			delete tempModalData[interaction.user.id];
			const recruitmentId = uuidv4();
			const embed = new EmbedBuilder()
				.setColor('Green')
				.setTitle(`【募集中】${tempData.title || 'タイトル'}`)
				.setDescription(
					`【募集ID】: ${recruitmentId}\n` +
					`ステータス: 募集中\n\n` +
					`**募集人数:**\n${tempData.bosyuNum2 === 0 ? '無制限' : tempData.bosyuNum2}\n` +
					`**募集開始者:**\n<@${interaction.user.id}>\n` +
					(mode === 'reservation' ? `**開始予定時刻:** \n${startTime} ${joinAfter === 'はい' ? '(参加後も開始可能)' : ''}\n` : '') +
					`**詳細:**\n${details}\n` +
					`**参加コード(ID&URL):**\n||${gameInfo}||\n` +
					`**備考:**\n${notes}`
					
				)
				.addFields(
					{ name: '参加者 (0人)', value: 'なし' },
					{ name: '予約者 (0人)', value: 'なし' }
				)
				.setFooter({ text: 'ゲームから退出した際は退出ボタンを押してください。(最近押さない人が増えています) - ShibakenBOT' })
				.setTimestamp()
				;
			// 変更: 公開メッセージは interaction.channel.send で送信
			const buttons = [
				new ButtonBuilder().setCustomId('bosyu_join').setLabel('参加').setStyle(ButtonStyle.Success).setEmoji('✅'),
				new ButtonBuilder().setCustomId('bosyu_leave').setLabel('退出').setStyle(ButtonStyle.Danger).setEmoji('👋'),
				new ButtonBuilder().setCustomId('bosyu_reserve').setLabel('予約').setStyle(ButtonStyle.Primary).setEmoji('⏰'),
				new ButtonBuilder().setCustomId('bosyu_notifystart').setLabel('開始時通知').setStyle(ButtonStyle.Primary).setEmoji('🔔'),
				new ButtonBuilder().setCustomId('bosyu_call_participants').setLabel('参加者呼び出し').setStyle(ButtonStyle.Secondary).setEmoji('🛎️'),
				new ButtonBuilder().setCustomId('bosyu_call_reservers').setLabel('予約者呼び出し').setStyle(ButtonStyle.Secondary).setEmoji('🛎️'),
				new ButtonBuilder().setCustomId('bosyu_game_start').setLabel('試合開始扱い').setStyle(ButtonStyle.Success).setEmoji('🟢'),
				new ButtonBuilder().setCustomId('bosyu_game_end').setLabel('試合終了扱い').setStyle(ButtonStyle.Danger).setEmoji('❌'),
				new ButtonBuilder().setCustomId('bosyu_end').setLabel('募集終了').setStyle(ButtonStyle.Danger).setEmoji('❌'),
				new ButtonBuilder().setCustomId('bosyu_edit').setLabel('内容編集').setStyle(ButtonStyle.Secondary).setEmoji('⚙️')
			];
			// 新規追加: MOD専用ボタンを新しい行に追加
			const modButton = new ButtonBuilder().setCustomId('bosyu_modkick').setLabel('MOD専用').setStyle(ButtonStyle.Secondary).setEmoji('🛠️');
			const row1 = new ActionRowBuilder().addComponents(...buttons.slice(0, 5));
			const row2 = new ActionRowBuilder().addComponents(...buttons.slice(5));
			const row3 = new ActionRowBuilder().addComponents(modButton);
			// 公開メッセージの送信
			const replyMessage = await interaction.channel.send({ embeds: [embed], components: [row1, row2, row3] });
			// 転載メッセージ送信
			const pubChannel = interaction.client.channels.cache.get('1335880014373322760');
			const linkButton = new ButtonBuilder()
				.setLabel('詳細はこちら')
				.setStyle(ButtonStyle.Link)
				.setURL(`https://discord.com/channels/${replyMessage.guild.id}/${replyMessage.channel.id}/${replyMessage.id}`);
			const linkRow = new ActionRowBuilder().addComponents(linkButton);
			const pubMessage = await pubChannel.send({ embeds: [embed], components: [linkRow] });
			// 掲示用情報の保存
			recruitmentData[recruitmentId] = {
				id: recruitmentId,
				user: interaction.user.id,
				mode,
				details,
				gameInfo,
				notes,
				startTime,
				joinAfter,
				title: tempData.title || 'タイトル',
				bosyuNum2: tempData.bosyuNum2 || 0,
				replyInfo: {
					guildId: replyMessage.guild.id,
					channelId: replyMessage.channel.id,
					messageId: replyMessage.id
				},
				publishInfo: {
					guildId: pubMessage.guild.id,
					channelId: pubMessage.channel.id,
					messageId: pubMessage.id
				},
				participants: [],
				reservers: []
			};
			// 確認用 ephemeral reply を1回だけ実施
			return interaction.reply({ content: `募集を作成しました。募集ID: ${recruitmentId}`, ephemeral: true });
		} catch (error) {
			console.error("handleModalSubmit error:", error);
			return interaction.reply({ content: '募集フォームの処理中にエラーが発生しました。', ephemeral: true });
		}
	},
	// 各種ボタン押下時の処理
	async handleButton(interaction) {
		const customId = interaction.customId;
		const messageId = interaction.message.id;
		let recruitment;
		// 追加: message.idと募集情報のreplyInfo.messageIdを突合し、募集情報を検索
		for (const id in recruitmentData) {
			if (recruitmentData[id].replyInfo.messageId === messageId) {
				recruitment = recruitmentData[id];
				break;
			}
		}
		if (!recruitment) {
			return interaction.reply({ content: '募集情報が見つかりません。', ephemeral: true });
		}
		switch (customId) {
			case 'bosyu_join':
				// 新規追加: 予約状態の場合は予約一覧から削除
				if (recruitment.reservers.find(obj => obj.id === interaction.user.id)) {
					recruitment.reservers = recruitment.reservers.filter(obj => obj.id !== interaction.user.id);
				}
				if (!recruitment.participants.includes(interaction.user.id)) {
					recruitment.participants.push(interaction.user.id);
					await updateRecruitmentEmbed(recruitment, interaction.client);
					return interaction.reply({ content: '参加済みに追加しました。', ephemeral: true });
				} else {
					return interaction.reply({ content: '既に参加済みです。', ephemeral: true });
				}
			case 'bosyu_leave':
				// 変更: 退出時に参加リストと予約リストの両方からユーザーを削除
				recruitment.participants = recruitment.participants.filter(id => id !== interaction.user.id);
				recruitment.reservers = recruitment.reservers.filter(obj => obj.id !== interaction.user.id);
				await updateRecruitmentEmbed(recruitment, interaction.client);
				return interaction.reply({ content: '参加および予約リストから削除しました。', ephemeral: true });
			case 'bosyu_reserve': {
				const reserved = recruitment.reservers.find(obj => obj.id === interaction.user.id);
				const participated = recruitment.participants.includes(interaction.user.id);
				if (reserved) {
					// 予約状態なら取り消して参加に切り替え
					recruitment.reservers = recruitment.reservers.filter(obj => obj.id !== interaction.user.id);
					recruitment.participants.push(interaction.user.id);
					await updateRecruitmentEmbed(recruitment, interaction.client);
					return interaction.reply({ content: '予約から参加に切り替えました。', ephemeral: true });
				}
				if (participated) {
					// 参加状態なら参加リストを削除し、以降の処理で予約モーダルを表示
					recruitment.participants = recruitment.participants.filter(id => id !== interaction.user.id);
				}
				// 予約モーダル表示用：一時保存
				tempReserveData[interaction.user.id] = recruitment.id;
				const modal = new ModalBuilder()
					.setCustomId('bosyu_reserve_time_modal')
					.setTitle('予約参加情報入力');
				// 変更: 入力必須を解除し、未入力時は「時間未指定」とする
				const timeInput = new TextInputBuilder()
					.setCustomId('reserveStartTime')
					.setLabel('参加可能な時間 (例: 18:45、未入力の場合は「時間未指定」)')
					.setStyle(TextInputStyle.Short)
					.setRequired(false);
				modal.addComponents(new ActionRowBuilder().addComponents(timeInput));
				return interaction.showModal(modal);
			}
			case 'bosyu_notifystart': {
				// 開始通知処理
				// まず、エフェメラルな返信を送信
				await interaction.reply({ content: '予約を設定しました。開始時又は時間になったらお知らせします。', ephemeral: true });
				
				// 予約募集の場合は対象ユーザーを予約通知リストへ登録
				if (recruitment.mode === 'reservation') {
					// 新規プロパティ notifyList（なければ初期化）
					if (!recruitment.notifyList) recruitment.notifyList = [];
					if (!recruitment.notifyList.includes(interaction.user.id))
						recruitment.notifyList.push(interaction.user.id);
					
					// 予定開始時刻の設定 (例："18:30" を HH:mm として)
					const [hour, minute] = recruitment.startTime.split(':').map(Number);
					const nowJST = new Date(new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }));
					let scheduled = new Date(nowJST);
					scheduled.setHours(hour, minute, 0, 0);
					
					// すでに開始時刻が過ぎている場合は即時通知（募集が未開始の場合）
					if (nowJST > scheduled) {
						if (recruitment.status !== 'game_start') {
							const notifyChannel = interaction.client.channels.cache.get(recruitment.replyInfo.channelId);
							if (notifyChannel) {
								await notifyChannel.send(`<@${interaction.user.id}> 予約していた開始時刻 (${recruitment.startTime}) が過ぎましたが、募集はまだ開始されていません。`);
							}
						}
					} else {
						// 未到来の場合、予定時刻に合わせて通知する
						const delay = scheduled.getTime() - nowJST.getTime();
						setTimeout(async () => {
							// 募集がまだ開始されていなければ通知
							if (recruitment.status !== 'game_start') {
								const notifyChannel = interaction.client.channels.cache.get(recruitment.replyInfo.channelId);
								if (notifyChannel) {
									await notifyChannel.send(`<@${interaction.user.id}> 予約していた開始時刻 (${recruitment.startTime}) になりました。`);
								}
							}
						}, delay);
					}
				} else {
					// 即時募集の場合、ボタン押下ごとに通知メッセージを送信
					const notifyChannel = interaction.client.channels.cache.get(recruitment.replyInfo.channelId);
					if (notifyChannel) {
						await notifyChannel.send(`<@${interaction.user.id}> 開始通知: ${recruitment.title}`);
					}
				}
				await updateRecruitmentEmbed(recruitment, interaction.client);
				return;
			}
			case 'bosyu_call_participants':
				// 作成者または管理者のみ実行
				if (interaction.user.id !== recruitment.user && !interaction.member.permissions.has('ADMINISTRATOR')) {
					return interaction.reply({ content: '作成者または管理者のみ呼び出し可能です。', ephemeral: true });
				}
				return interaction.reply({ content: `参加者へ呼び出し: ${recruitment.participants.map(id => `<@${id}>`).join(', ')}`});
			case 'bosyu_call_reservers':
				// 作成者または管理者のみ実行
				if (interaction.user.id !== recruitment.user && !interaction.member.permissions.has('ADMINISTRATOR')) {
					return interaction.reply({ content: '作成者または管理者のみ呼び出し可能です。', ephemeral: true });
				}
				// 予約者は各ユーザーの参加開始時刻付きで表示
				return interaction.reply({ content: `予約者へ呼び出し: ${recruitment.reservers.map(obj => `<@${obj.id}> (参加:${obj.startTime})`).join(', ')}`});
			case 'bosyu_game_start':
				recruitment.status = 'game_start';
				await updateRecruitmentEmbed(recruitment, interaction.client);
				return interaction.reply({ content: '試合開始として処理しました。', ephemeral: true });
			case 'bosyu_game_end':
				recruitment.status = 'game_end';
				await updateRecruitmentEmbed(recruitment, interaction.client);
				return interaction.reply({ content: '試合終了として処理しました。（待機状態）', ephemeral: true });
			case 'bosyu_end':
				// 募集終了は募集作成者または管理者のみ実行可能
				if (!(interaction.user.id === recruitment.user || interaction.member.permissions.has('ADMINISTRATOR'))) {
					return interaction.reply({ content: '募集作成者または管理者のみ募集終了できます。', ephemeral: true });
				}
				recruitment.status = 'closed';
				await updateRecruitmentEmbed(recruitment, interaction.client);
				// 募集終了後、情報を削除して/bosyu-infoに反映されないようにする
				delete recruitmentData[recruitment.id];
				return interaction.reply({ content: '募集終了としました。', ephemeral: true });
			case 'bosyu_edit': {
				// 編集は募集作成者または管理者のみ許可
				if (interaction.user.id !== recruitment.user && !interaction.member.permissions.has('ADMINISTRATOR')) {
					return interaction.reply({ content: '募集作成者または管理者のみ編集できます。', ephemeral: true });
				}
				tempEditData[interaction.user.id] = recruitment.id;
				// 編集用モーダル。予約募集なら追加項目付き
				const modal = new ModalBuilder().setCustomId('bosyu_edit_modal').setTitle('募集内容編集');
				modal.addComponents(
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId('edit_title')
							.setLabel('タイトル')
							.setStyle(TextInputStyle.Short)
							.setPlaceholder(recruitment.title)
					),
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId('edit_details')
							.setLabel('詳細')
							.setStyle(TextInputStyle.Paragraph)
							.setPlaceholder(recruitment.details)
					),
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId('edit_gameInfo')
							.setLabel('参加コード(ID&URL)')
							.setStyle(TextInputStyle.Short)
							.setPlaceholder(recruitment.gameInfo)
					),
					new ActionRowBuilder().addComponents(
						new TextInputBuilder()
							.setCustomId('edit_notes')
							.setLabel('備考')
							.setStyle(TextInputStyle.Paragraph)
							.setPlaceholder(recruitment.notes)
							.setRequired(false)
					)
				);
				// 予約募集の場合、開始時刻と参加後の状態も編集可能
				if (recruitment.mode === 'reservation') {
					modal.addComponents(
						new ActionRowBuilder().addComponents(
							new TextInputBuilder()
								.setCustomId('edit_startTime')
								.setLabel('開始予定時刻 (例: 18:30)')
								.setStyle(TextInputStyle.Short)
								.setPlaceholder(recruitment.startTime)
						),
						new ActionRowBuilder().addComponents(
							new TextInputBuilder()
								.setCustomId('edit_joinAfter')
								.setLabel('開始後参加可能か (はい/いいえ)')
								.setStyle(TextInputStyle.Short)
								.setPlaceholder(recruitment.joinAfter)
						)
					);
				}
				return interaction.showModal(modal);
			}
			case 'bosyu_modkick':
				// 管理者専用
				if (!interaction.member.permissions.has('ADMINISTRATOR')) {
					return interaction.reply({ content: '管理者専用です。', ephemeral: true });
				}
				// 一時保存
				tempModData[interaction.user.id] = recruitment.id;
				const modModal = new ModalBuilder()
					.setCustomId('bosyu_modkick_modal')
					.setTitle('MOD専用：対象ユーザー退出処理');
				const modInput = new TextInputBuilder()
					.setCustomId('mod_userID')
					.setLabel('ユーザーIDまたはタグを入力')
					.setStyle(TextInputStyle.Short)
					.setPlaceholder('例: 1234567890 または @username');
				modModal.addComponents(new ActionRowBuilder().addComponents(modInput));
				return interaction.showModal(modModal);
			default:
				return interaction.reply({ content: '未対応のボタンです。', ephemeral: true });
		}
	},
	// モーダル送信後：予約ボタン用モーダルからの処理
	async handleReserveModalSubmit(interaction) {
		let reserveStartTime = interaction.fields.getTextInputValue('reserveStartTime').trim();
        // 入力がある場合は hh:mm の形式チェック
        if (reserveStartTime !== '') {
            // 正規表現: 時刻の形式 hh:mm (hh: 0～23, mm: 0～59)
            const timeRegex = /^([01]?\d|2[0-3]):([0-5]\d)$/;
            const match = reserveStartTime.match(timeRegex);
            if (!match) {
                return interaction.reply({ content: '時間の入力形式が正しくありません。正しい形式は hh:mm (例: 18:45) です。', ephemeral: true });
            }
        } else {
            reserveStartTime = '時間不明';
        }
		const userId = interaction.user.id;
		const recruitmentId = tempReserveData[userId];
		if (!recruitmentId || !recruitmentData[recruitmentId]) {
			return interaction.reply({ content: '該当する募集が見つかりません。', ephemeral: true });
		}
		const recruitment = recruitmentData[recruitmentId];
		// 予約情報を追加
		recruitment.reservers.push({ id: userId, startTime: reserveStartTime });
		await updateRecruitmentEmbed(recruitment, interaction.client);
		delete tempReserveData[userId];
		return interaction.reply({ content: '予約情報を更新しました。', ephemeral: true });
	},
	// モーダル送信後：編集モーダルからの処理
	async handleEditModalSubmit(interaction) {
		const userId = interaction.user.id;
		const recruitmentId = tempEditData[userId];
		if (!recruitmentId || !recruitmentData[recruitmentId]) {
			return interaction.reply({ content: '該当する募集が見つかりません。', ephemeral: true });
		}
		const recruitment = recruitmentData[recruitmentId];
		try {
			const fields = interaction.fields;
			
			// タイトル更新（入力があれば更新、なければ変更しない）
			const newTitle = fields.getTextInputValue('edit_title').trim();
			if (newTitle !== '') recruitment.title = newTitle;
			
			// 詳細更新（入力があれば更新、なければ変更しない）
			const newDetails = fields.getTextInputValue('edit_details').trim();
			if (newDetails !== '') recruitment.details = newDetails;
			
			// 参加コード(ID&URL)更新
			const newGameInfo = fields.getTextInputValue('edit_gameInfo').trim();
			if (newGameInfo !== '') recruitment.gameInfo = newGameInfo;
			
			// 備考更新
			let newNotes = "";
			try {
				newNotes = fields.getTextInputValue('edit_notes').trim();
			} catch (e) {
				newNotes = "";
			}
			if (newNotes !== '') recruitment.notes = newNotes;
	
			// 予約募集の場合のみ、開始予定時刻と参加後の状態の更新
			if (recruitment.mode === 'reservation') {
				let newStartTime = "";
				try {
					newStartTime = fields.getTextInputValue('edit_startTime').trim();
				} catch (e) {
					newStartTime = "";
				}
				if (newStartTime !== '') recruitment.startTime = newStartTime;
				
				let newJoinAfter = "";
				try {
					newJoinAfter = fields.getTextInputValue('edit_joinAfter').trim();
				} catch (e) {
					newJoinAfter = "";
				}
				if (newJoinAfter !== '') recruitment.joinAfter = newJoinAfter;
			}
			
			// 募集メッセージのEmbedを更新
			await updateRecruitmentEmbed(recruitment, interaction.client);
			delete tempEditData[userId];
			return interaction.reply({ content: '募集情報が更新されました。', ephemeral: true });
		} catch (error) {
			console.error('Edit Modal submission error:', error);
			await interaction.reply({ content: "編集モーダルの処理に失敗しました。", ephemeral: true });
		}
	},
	// 新規追加: MOD専用モーダル送信後の処理
	async handleModKickModalSubmit(interaction) {
		const userId = interaction.user.id;
		const recruitmentId = tempModData[userId];
		if (!recruitmentId || !recruitmentData[recruitmentId]) {
			return interaction.reply({ content: '該当する募集が見つかりません。', ephemeral: true });
		}
		const recruitment = recruitmentData[recruitmentId];
		let input = interaction.fields.getTextInputValue('mod_userID').trim();
		// ユーザーIDとして数字部分を抽出
		const idMatch = input.match(/\d+/);
		if (!idMatch) {
			return interaction.reply({ content: '有効なユーザーIDまたはタグが入力されていません。', ephemeral: true });
		}
		const targetId = idMatch[0];
		const wasParticipant = recruitment.participants.includes(targetId);
		const wasReserver = recruitment.reservers.some(obj => obj.id === targetId);
		if (!wasParticipant && !wasReserver) {
			return interaction.reply({ content: '指定されたユーザーは参加または予約済みではありません。', ephemeral: true });
		}
		// 該当ユーザーを削除
		recruitment.participants = recruitment.participants.filter(id => id !== targetId);
		recruitment.reservers = recruitment.reservers.filter(obj => obj.id !== targetId);
		await updateRecruitmentEmbed(recruitment, interaction.client);
		delete tempModData[userId];
		return interaction.reply({ content: '対象ユーザーを退出処理しました。', ephemeral: true });
	},
	// 外部参照用：特定募集の取得
	getRecruitment(recruitmentId) {
		return recruitmentData[recruitmentId];
	},
	// 外部参照用：全募集一覧の取得
	getAllRecruitments() {
		return recruitmentData;
	}
};
