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
            '/makechara',
            '/makechara2',
            '/makechara3', 
            '/d <数字>d<数字>',
            '/bd <数字>',
            '/pd <数字>',
            '/guide <list, create1,create2>※WIP',
        ];
        message.channel.send("```css\n" + helps.join('\n') + "```\n");
    }

    // ステータス3候補型ランダム生成(6版準拠)
    if (message.content == '/makechara') {
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
        const msg = `《 ${message.author} さんの自動振り分け結果》` + "```css\n" + scores.join('\n') + "```\n";

        message.channel.send(msg);
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
    return ability + '【' + getAbilityScore(3, 18) + ',' + getAbilityScore(3, 18) + ',' + getAbilityScore(3, 18) + '】';
}

function getAbilityScore(min, max) {
    // min～maxのランダムな整数
    return Math.floor(Math.random() * (max - min)) + min;
}
