const http = require('http');
http.createServer(function (req, res) {
  res.write("online");
  res.end();
}).listen(8080);

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages]
});

// 起動確認
client.once('ready', () => {
    console.log(`${client.user.tag} Ready`);
});

// 返答
client.on('messageCreate', message => {
    if (message.author.bot) {
        return;
    }

    if (message.content == 'hi') {
        message.channel.send('hi!');
    }

    if (message.content == 'places') {
        getResource('places');
    }

    // コマンドヘルプ
    if (message.content == '/help') {
        const helps = [
            '/make',
            '/make2',
            '/make3', 
            '/d <数字>d<数字>',
            '/bd <数字>',
            '/pd <数字>',
            '/guide <list, create1,create2>※WIP',
        ];

        const payload = "```css\n" + helps.join('\n') + "```\n";
        sendMessage(message, payload);
    }

    // ステータス3候補型ランダム生成(6版準拠)
    if (message.content == '/make') {
        const titles = [
            'STR(筋力)',
            'CON(健康)',
            'POW(精神)',
            'DEX(敏捷)',
            'APP(外見)',
            'SIZ(体格)',
            'INT(知力)',
            'EDU(教育)',
        ];
        const scores = titles.map(x => getChara1Score(x));

        const payload = `《 ${message.author} さんの自動振り分け結果》` + "```css\n" + scores.join('\n') + "```\n";
        sendMessage(message, payload);
    }

    // ダイス(/d <数字>d<数字>)
    if (message.content.startsWith('/d')) {
        const parameter = message.content.slice(3);
        const rolls = parameter.split('d').map(x => parseInt(x));

        if (rolls.length !== 2) {
            return
        }

        const diceAttempts = rolls[0];
        const diceMax = rolls[1];
        const diceResults = [...Array(diceAttempts)].map(() => getRandomInt(1, diceMax));
        const sum = diceResults.reduce((sum, x) => sum + x, 0);

        const payload = `**${message.author} さんのダイスロール(${parameter}) ⇒⇒⇒ [${diceResults.toString()}] 合計【${sum}】**`;
        sendMessage(message, payload);
    }
});

// Discordへの接続
client.login(process.env.DISCORD_BOT_SECRET);

function getResource(filename) {
    const values = require("./resources/" + filename + ".json" );
    // console.log(values);
    values.forEach(function(element){
        console.log(element);
    });
}

function getChara1Score(ability) {
    return ability + '【' + getRandomInt(3, 18) + ',' + getRandomInt(3, 18) + ',' + getRandomInt(3, 18) + '】';
}

function getRandomInt(min, max) {
    // min～maxのランダムな整数
    return Math.floor(Math.random() * (max - min)) + min;
}

function sendMessage(message, payload) {
    message.channel.send(payload);
}
