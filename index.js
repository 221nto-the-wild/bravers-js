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

    if (message.content == 'mk') {
        console.log(message.author);
        const message = getChara1Score('STR(筋力)') + '\n'
            + getChara1Score('CON(健康)') + '\n'
            + getChara1Score('POW(精神)') + '\n'
            + getChara1Score('DEX(敏捷)') + '\n'
            + getChara1Score('APP(外見)') + '\n'
            + getChara1Score('SIZ(体格)') + '\n'
            + getChara1Score('INT(知力)') + '\n'
            + getChara1Score('EDU(教育)') + '\n'
            ;
        message.channel.send(`《 ${message.author} さんの自動振り分け結果》`);
        message.channel.send("```css\n" + getChara1Score('STR(筋力)') + "```\n");
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
