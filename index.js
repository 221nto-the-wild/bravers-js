const http = require('http');
http.createServer(function (req, res) {
  res.write("online");
  res.end();
}).listen(8080);

const { Client, EmbedBuilder, GatewayIntentBits } = require('discord.js');
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

    // コマンドヘルプ
    if (message.content === '/help') {
        const helps = [
            '/make',
            '/make2',
            '/make3', 
            '/d <ダイス数> <ダイスの目>',
            '/bd <追加ダイス数>',
            '/pd <追加ダイス数>',
        ];

        const payload = "```css\n" + helps.join('\n') + "```\n";
        sendMessage(message, payload);
    }

    // ステータス3候補型ランダム生成(6版準拠)
    if (message.content === '/make') {
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

    // ステータス3候補型ランダム生成(7版準拠)
    if (message.content === '/make2') {
        const abilities = [
            { name: '◆《筋力》 (STR)', min: 3 },
            { name: '◆《体力》 (CON)', min: 3 },
            { name: '◆《体格》 (SIZ)', min: 8 },
            { name: '◆《敏捷》 (DEX)', min: 3 },
            { name: '◆《外見》 (APP)', min: 3 },
            { name: '◆《知力》 (INT)', min: 8 },
            { name: '◆《精神》 (POW)', min: 3 },
            { name: '◆《教育》 (EDU)', min: 8 },
            { name: '◆《幸運》', min: 3 },
        ];

        let embed = new EmbedBuilder()
            .setColor(0xff93c9)
            .setTitle('〔Call of Cthulhu TRPG 7th Edition 準拠〕')
	        .setDescription(`${message.author} さんのキャラは…`);

        abilities.forEach((x) => {
            const field = {
                name: x.name,
                value: getChara2Score(x.min, 18),
                inline: true
            };
            embed.addFields(field);
        });

        sendMessage(message, { embeds: [embed] });
    }

    // ダイス
    if (message.content.startsWith('/d')) {
        const args = message.content.split(' ');
        
        if (args.length !== 3) {
            sendMessage(message, '*Please enter `/d <ダイス数> <ダイスの目>`*');
            return;
        }

        const diceAttempts = parseInt(args[1]);
        
        if (isNaN(diceAttempts) || diceAttempts < 1) {
            sendMessage(message, '*`<ダイス数>` に正数を入力してください：`' + args[1] + '`*');
            return;
        }

        const diceMax = parseInt(args[2]);
        
        if (isNaN(diceMax) || diceMax < 1) {
            sendMessage(message, '*`<ダイスの目>` に正数を入力してください：`' + args[2] + '`*');
            return;
        }

        const diceResults = [...Array(diceAttempts)].map(() => getRandomInt(1, diceMax));
        const sum = diceResults.reduce((sum, x) => sum + x, 0);

        const payload = `**${message.author} さんのダイスロール(${diceAttempts}d${diceMax}) ⇒⇒⇒ [${diceResults.toString()}] 合計【${sum}】**`;
        sendMessage(message, payload);
    }

    // ボーナスダイス
    if (message.content.startsWith('/bd')) {
        const args = message.content.split(' ');
        
        if (args.length !== 2) {
            sendMessage(message, '*Please enter `/bd <追加ダイス数>`*');
            return;
        }

        const additionalNumber = parseInt(args[1]);
        
        if (isNaN(additionalNumber) || additionalNumber < 1) {
            sendMessage(message, '*`<追加ダイス数>` に正数を入力してください：`' + args[1] + '`*');
            return;
        }

        const onesPlace = getRandomInt(0, 9);
        const tensPlaces = [...Array(additionalNumber + 1)].map(() => getRandomInt(0, 10) * 10);
        const maxTensPlace = Math.max(...tensPlaces);
        let minTensPlace = Math.min(...tensPlaces);
        
        if (minTensPlace + onesPlace === 0) {
            minTensPlace = tensPlaces.sort()[1];
        }

        let result = minTensPlace + onesPlace;
        const isFumble = (maxTensPlace + onesPlace === 0);

        if (isFumble) {
            result = 100;
        }

        const payload = `**${message.author} さんのボーナス・ダイス(+${additionalNumber}個)の出目は〔${result}〕(出目は[${tensPlaces.toString()}])**`;
        sendMessage(message, payload);
    }

    // ペナルティーダイス
    if (message.content.startsWith('/pd')) {
        const args = message.content.split(' ');
        
        if (args.length !== 2) {
            sendMessage(message, '*Please enter `/pd <追加ダイス数>`*');
            return;
        }

        const additionalNumber = parseInt(args[1]);
        
        if (isNaN(additionalNumber) || additionalNumber < 1) {
            sendMessage(message, '*`<追加ダイス数>` に正数を入力してください：`' + args[1] + '`*');
            return;
        }

        const onesPlace = getRandomInt(0, 9);
        const tensPlaces = [...Array(additionalNumber + 1)].map(() => getRandomInt(0, 10) * 10);
        const maxTensPlace = Math.max(...tensPlaces);
        const minTensPlace = Math.min(...tensPlaces);
        let result = maxTensPlace + onesPlace;
        const isFumble = (minTensPlace + onesPlace === 0);

        if (isFumble) {
            result = 100;
        }

        const payload = `**${message.author} さんのペナルティー・ダイス(+${additionalNumber}個)の出目は〔${result}〕(出目は[${tensPlaces.toString()}])**`;
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

function getChara2Score(min, max) {
    return '①' + getRandomInt(min, max)*5 + '\n②' + getRandomInt(min, max)*5 + '\n③' + getRandomInt(min, max)*5;
}

function getRandomInt(min, max) {
    // min～maxのランダムな整数
    return Math.floor(Math.random() * (max - min)) + min;
}

function sendMessage(message, payload) {
    message.channel.send(payload);
}
