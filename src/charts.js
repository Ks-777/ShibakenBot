const fs = require('fs');
const path = require('path');
const https = require('https');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { registerFont } = require('canvas');

// フォントディレクトリと圧縮URLの設定
const fontDir = path.join(process.cwd(), 'assets/fonts');
const fontUrl = 'https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/OTF/Japanese/NotoSansCJKjp-Bold.otf';
const fontPath = path.join(fontDir, 'NotoSansCJKjp-Bold.otf');

// 非同期でフォントをダウンロードし、登録する Promise（バッファを用いる方式に変更）
const fontInit = new Promise((resolve, reject) => {
    if (fs.existsSync(fontPath)) {
        try {
            registerFont(fontPath, { family: 'NotoSansCJKjp-Bold' });
            resolve();
        } catch (err) {
            reject(err);
        }
    } else {
        fs.mkdirSync(fontDir, { recursive: true });
        const options = {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        };
        https.get(fontUrl, options, (response) => {
            if (response.statusCode !== 200) {
                return reject(new Error(`Failed to download font, status code: ${response.statusCode}`));
            }
            const contentType = response.headers['content-type'];
            if (!contentType || !/font|octet-stream/.test(contentType)) {
                return reject(new Error(`Unexpected content type: ${contentType}`));
            }
            let data = [];
            response.on('data', (chunk) => data.push(chunk));
            response.on('end', () => {
                const buffer = Buffer.concat(data);
                fs.writeFileSync(fontPath, buffer);
                try {
                    registerFont(fontPath, { family: 'NotoSansCJKjp-Bold' });
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    }
});

const width = 800; // px
const height = 400; // px
const chartJSNodeCanvas = new ChartJSNodeCanvas({ 
    width, 
    height,
    chartCallback: (ChartJS) => {
        ChartJS.defaults.font.family = 'NotoSansCJKjp-Bold';
    }
});

/**
 * 過去7日分のメッセージ数の折れ線グラフを生成
 * @param {Object} allData - 日付キーのデータオブジェクト
 * @returns {Promise<Buffer>}
 */
async function generateLineChart(allData) {
    await fontInit;
    const dates = Object.keys(allData).sort();
    const recent = dates.slice(-7);
    const counts = recent.map(date => allData[date].total);
  
    const configuration = {
        type: 'line',
        data: {
            labels: recent,
            datasets: [{
                label: '総メッセージ数',
                data: counts,
                borderColor: 'rgba(75,192,192,1)',
                fill: false,
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: '過去7日分のメッセージ数'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };
    return await chartJSNodeCanvas.renderToBuffer(configuration);
}

/**
 * 当日の棒グラフ（BOT含む、BOT除く、BOTのみ）を生成
 * @param {Object} today - 当日のデータ { total, nonBot, bot }
 * @returns {Promise<Buffer>}
 */
async function generateBarChart(today) {
    await fontInit;
    const configuration = {
        type: 'bar',
        data: {
            labels: ['BOT含む', 'BOT除く', 'BOTのみ'],
            datasets: [{
                label: 'メッセージ数',
                data: [today.total, today.nonBot, today.bot],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 99, 132, 0.6)'
                ]
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: '当日のメッセージ数'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };
    return await chartJSNodeCanvas.renderToBuffer(configuration);
}

module.exports = {
    generateLineChart,
    generateBarChart
};
