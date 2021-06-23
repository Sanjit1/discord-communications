var discord = require('discord.js')
const client = new discord.Client();
var botInfo;
var bots = [];
var theta = 'θ';
var outgoingMessages = [];
var incomingMessages = [];

function constructor(token, id, SYN, ACK, FIN) {
    client.login(token);
    botInfo = {
        'ID': id,
        'SYN': SYN,
        'FIN': FIN,
        'ACK': ACK,
    }
}

function addCommunicationBot(guildID, channelID, botInfo) {
    bots.push({
        'serverID': guildID,
        'channelID': channelID,
        'info': botInfo
    });
}

function getInfo() {
    return botInfo;
}

function sendMessage(id, messageToSend) {
    bot = bots.find(b => { return b['info']['ID'] == id });
    if (typeof bot === 'undefined') {
        throw ('Bot not in list: ' + id);
    }
    server = client.guilds.cache.get(bot['serverID']);
    if (typeof server === 'undefined') {
        throw ('Server cannot be found: ' + id);
    }
    communicationChannel = server.channels.get(bot['channelID']);
    if (!communicationChannel.permissionsFor(client.users.fetch(botInfo['ID'])).has(['SEND_MESSAGES', 'READ_MESSAGE_HISTORY'])) {
        throw ('Bot missing permission to view/send messages: ' + id);
    }
    transactionCode = (1000000 + Math.floor(Math.random() * 999999)).toString();
    communicationChannel.send(transactionCode + id.toString() + theta + botInfo['SYN']);
    msg = {
        'code': transactionCode,
        'id': id,
        'state': 'SYN',
        'messageToSend': messageToSend,
    };
    outgoingMessages.push(msg);
}

client.on('message', msg => {
    messageContent = msg.content;
    likelyMessage = outgoingMessages.find(m => { return msg.startsWith(m['code']) });
    if (msg.author.id == botInfo.)
        if (msg.author.id == likelyMessage['id'] && likelyMessage.split(theta)[0].endsWith(botInfo['ID'])) {
            bot = bots.find(b => { return b['info']['ID'] == id });
            if (likelyMessage['state'] == 'SYN' && messageContent.endsWith(bot['botInfo']['ACK'])) {
                likelyMessage['state'] == 'SYNACK';
            } else if (likelyMessage['state'] == 'SYNACK' && messageContent.endsWith(bot['botInfo']['SYN'])) {
                msg.channel.send(likelyMessage['code'] + likelyMessage['id'] + theta + botInfo['SYN']);
                likelyMessage['state'] == 'SYNACKSYN';
                msg.channel.send(JSON.stringify(messageToSend));
                likelyMessage['state'] == 'SYNACKSYNsent';
                msg.channel.send(likelyMessage['code'] + likelyMessage['id'] + theta + botInfo['FIN']);
                likelyMessage['state'] == 'SYNACKSYNsentFIN';
            } else if (likelyMessage['state'] == 'SYNACKSYNsentFIN' && messageContent.endsWith(bot['botInfo']['ACK'])) {
                likelyMessage['state'] == 'SYNACKSYNsentFINACK';
            } else if (likelyMessage['state'] == 'SYNACKSYNsentFINACK' && messageContent.endsWith(bot['botInfo']['ACK'])) {
                likelyMessage['state'] == 'SYNACK';
            }
        }
});