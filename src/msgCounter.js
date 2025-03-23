const fs = require('fs');
const path = require('path');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const charts = require('./charts.js');

// 新規：このコードと同じ階層にあるmsgCountDate.jsonを使用するための設定
const dataDir = __dirname;
const dataFilePath = path.join(dataDir, 'msgCountDate.json');

let dailyBotCount = 0;
let dailyNonBotCount = 0;
let clientInstance = null;

function loadMsgCountData() {
  if (!fs.existsSync(dataFilePath)) return {};
  try {
    const content = fs.readFileSync(dataFilePath, 'utf8').trim();
    return content ? JSON.parse(content) : {};
  } catch (err) {
    console.error("msgCountDate.json parse error:", err);
    return {};
  }
}

// 当日分カウントを更新するヘルパー関数（オブジェクト形式に統一）
function updateDailyCount(member) {
  const today = new Date().toISOString().slice(0, 10);
  let data = {};
  if (fs.existsSync(dataFilePath)) {
    try {
      const content = fs.readFileSync(dataFilePath, 'utf8').trim();
      data = content ? JSON.parse(content) : {};
    } catch (error) {
      console.error('msgCountDate.json 読み込みエラー:', error);
      data = {};
    }
  }
  // 初回ならオブジェクトで初期化
  if (!data[today] || typeof data[today] !== 'object') {
    data[today] = { total: 0, nonBot: 0, bot: 0 };
  }
  data[today].total += 1;
  // 更新: member.author.bot に応じて適切にカウントを追加
  if (member.author.bot) {
    data[today].bot += 1;
  } else {
    data[today].nonBot += 1;
  }
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

// messageCreate イベントから呼び出す
function handleMessage(message) {
  if (!message.author) return;
  if (message.author.bot) dailyBotCount++;
  else dailyNonBotCount++;
  updateDailyCount(message);
}

async function postDailyReport() {
  if (!clientInstance) return;
  const now = new Date();
  const jstString = now.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  const jstDate = new Date(jstString);
  const year = jstDate.getFullYear();
  const month = ("0" + (jstDate.getMonth() + 1)).slice(-2);
  const day = ("0" + jstDate.getDate()).slice(-2);
  const dateKey = `${year}-${month}-${day}`;

  const totalCount = dailyBotCount + dailyNonBotCount;
  const embed = new EmbedBuilder()
    .setTitle(`${dateKey} のメッセージ数`)
    .addFields(
      { name: 'BOTを含むメッセージ数', value: `${totalCount}`, inline: true },
      { name: 'BOTを除くメッセージ数', value: `${dailyNonBotCount}`, inline: true }
    )
    .setColor('Blue')
    .setTimestamp();

  const button = new ButtonBuilder()
    .setCustomId('msgcounter_past7')
    .setLabel('過去7日分表示')
    .setStyle(ButtonStyle.Primary);
  const row = new ActionRowBuilder().addComponents(button);

  try {
    const thread = await clientInstance.channels.fetch('1312307620333223937');
    if (thread) {
      await thread.send({ embeds: [embed], components: [row] });
    }
  } catch (err) {
    console.error("Daily report post error:", err);
  }

  const allData = loadMsgCountData();
  allData[dateKey] = {
    total: totalCount,
    nonBot: dailyNonBotCount,
    bot: dailyBotCount
  };
  const keys = Object.keys(allData).sort();
  if (keys.length > 7) {
    const removeKeys = keys.slice(0, keys.length - 7);
    removeKeys.forEach(key => delete allData[key]);
  }
  fs.writeFileSync(dataFilePath, JSON.stringify(allData, null, 2));

  dailyBotCount = 0;
  dailyNonBotCount = 0;
}

function scheduleDailyReport() {
  const now = new Date();
  const jstNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  const nextMidnight = new Date(jstNow.getFullYear(), jstNow.getMonth(), jstNow.getDate() + 1, 0, 0, 0);
  const delay = nextMidnight.getTime() - jstNow.getTime();
  setTimeout(async () => {
    await postDailyReport();
    scheduleDailyReport();
  }, delay);
}

function initMsgCounter(client) {
  clientInstance = client;
  scheduleDailyReport();
}

// ボタン押下時に過去7日分のデータをEmbedで提示（グラフ付き）
async function handlePast7Button(interaction) {
  const allData = loadMsgCountData();
  const dates = Object.keys(allData).sort();
  const recentDates = dates.slice(-7);
  let description = '';
  recentDates.forEach(dateKey => {
    const data = allData[dateKey];
    description += `${dateKey}: BOT含む ${data.total} / BOT除く ${data.nonBot}\n`;
  });

  const lineChartBuffer = await charts.generateLineChart(allData);
  const now = new Date();
  const jstString = now.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  const jstDate = new Date(jstString);
  const year = jstDate.getFullYear();
  const month = ("0" + (jstDate.getMonth() + 1)).slice(-2);
  const day = ("0" + jstDate.getDate()).slice(-2);
  const todayKey = `${year}-${month}-${day}`;
  const today = allData[todayKey] || { total: 0, nonBot: 0, bot: 0 };
  const barChartBuffer = await charts.generateBarChart(today);

  const embedLine = new EmbedBuilder()
    .setTitle('過去7日分のメッセージ数（折れ線グラフ）')
    .setDescription(description || 'データがありません')
    .setColor('Green')
    .setTimestamp()
    .setImage('attachment://lineChart.png');

  const embedBar = new EmbedBuilder()
    .setTitle('当日のメッセージ数（棒グラフ）')
    .setColor('Blue')
    .setTimestamp()
    .setImage('attachment://barChart.png');

  return interaction.reply({
    embeds: [embedLine, embedBar],
    files: [
      { attachment: lineChartBuffer, name: "lineChart.png" },
      { attachment: barChartBuffer, name: "barChart.png" }
    ],
    ephemeral: true
  });
}

module.exports = {
  handleMessage,
  initMsgCounter,
  handlePast7Button
};
