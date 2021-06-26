const EventEmitter = require('events');
var discord = require('discord.js');
var theta = 'θ';
class emitter extends EventEmitter { };

module.exports = class client extends EventEmitter {
    constructor(token, id, SYN, ACK, FIN, separator) {
        super();
        this.discordClient = new discord.Client();
        this.botInfo;
        this.bots = [];
        this.outgoingMessages = [];
        this.incomingMessages = [];
        this.discordClient.login(token);
        this.botInfo = {
            'ID': id,
            'SYN': SYN,
            'FIN': FIN,
            'ACK': ACK,
            'separator': separator
        }
        this.discordClient.on('message', msg => {
            var messageContent = msg.content;
            var outgoingMessage = this.outgoingMessages.find(m => { return messageContent.startsWith(m['code']) });
            var bot = this.bots.find(b => { return b['botInfo']['ID'] == msg.author.id });
            if (outgoingMessage && msg.author.id == outgoingMessage['id'] && messageContent.split(theta)[0].endsWith(this.botInfo['ID'])) {
                if (outgoingMessage['state'] == 'SYN' && messageContent.endsWith(bot['botInfo']['ACK'])) {
                    outgoingMessage['state'] = 'SYNACK';
                } else if (outgoingMessage['state'] == 'SYNACK' && messageContent.endsWith(bot['botInfo']['SYN'])) {
                    outgoingMessage['state'] = 'SYNACKSYN';
                    msg.channel.send(outgoingMessage['code'] + outgoingMessage['id'] + theta + this.botInfo['ACK']);
                    outgoingMessage['state'] = 'SYNACKSYNACK';
                    msg.channel.send(outgoingMessage['code'] + outgoingMessage['id'] + theta + JSON.stringify(outgoingMessage['messageToSend']));
                    outgoingMessage['state'] = 'SYNACKSYNACKsent';
                    msg.channel.send(outgoingMessage['code'] + outgoingMessage['id'] + theta + this.botInfo['FIN']);
                    outgoingMessage['state'] = 'SYNACKSYNACKsentFIN';
                } else if (outgoingMessage['state'] == 'SYNACKSYNACKsentFIN' && messageContent.endsWith(bot['botInfo']['ACK'])) {
                    outgoingMessage['state'] = 'SYNACKSYNACKsentFINACK';
                } else if (outgoingMessage['state'] == 'SYNACKSYNACKsentFINACK' && messageContent.endsWith(bot['botInfo']['FIN'])) {
                    msg.channel.send(outgoingMessage['code'] + outgoingMessage['id'] + theta + this.botInfo['ACK']);
                    outgoingMessage['state'] = 'SUCCESS';
                }
            } else if (bot && messageContent.split(theta)[0].endsWith(this.botInfo['ID'])) {
                var incomingMessage = this.incomingMessages.find(m => { return messageContent.startsWith(m['code']) });
                if (incomingMessage) {
                    if (incomingMessage['state'] == 'SYNACKSYN' && messageContent.endsWith(bot['botInfo']['ACK'])) {
                        incomingMessage['state'] = 'SYNACKSYNACK';
                    } else if (incomingMessage['state'] == 'SYNACKSYNACK' && messageContent.startsWith(incomingMessage['code'] + this.botInfo['ID'] + theta)) {
                        var l = messageContent.split(theta);
                        l.shift();
                        incomingMessage['message'] = l.join(theta);
                        incomingMessage['state'] = 'SYNACKSYNACKrecieved';
                    } else if (incomingMessage['state'] == 'SYNACKSYNACKrecieved' && messageContent.endsWith(bot['botInfo']['FIN'])) {
                        incomingMessage['state'] = 'SYNACKSYNACKrecievedFIN';
                        msg.channel.send(incomingMessage['code'] + incomingMessage['id'] + theta + this.botInfo['ACK']);
                        incomingMessage['state'] = 'SYNACKSYNACKrecievedFINACK';
                        msg.channel.send(incomingMessage['code'] + incomingMessage['id'] + theta + this.botInfo['FIN']);
                        incomingMessage['state'] = 'SYNACKSYNACKrecievedFINACKFIN';
                    } else if (incomingMessage['state'] == 'SYNACKSYNACKrecievedFINACKFIN' && messageContent.endsWith(bot['botInfo']['ACK'])) {
                        incomingMessage['state'] = 'SUCCESS'
                        msg.channel.send(this.botInfo['separator']);
                    }
                } else if (messageContent.split(theta)[0].endsWith(this.botInfo['ID']) && messageContent.endsWith(bot['botInfo']['SYN'])) {
                    var msgTransaction = {
                        'code': messageContent.substring(0, 7),
                        'id': bot['botInfo']['ID'],
                        'state': 'SYN',
                        'message': undefined
                    };
                    this.incomingMessages.push(msgTransaction);
                    var successInterval = setInterval(() => {
                        if (msgTransaction['state'] == 'SUCCESS') {
                            this.emit('message', msgTransaction['message']);
                            clearInterval(successInterval);
                        }
                    }, 1000);
                    setTimeout(() => {
                        if (msgTransaction['state'] != 'SUCCESS') {
                            this.emit('messageFailed', msgTransaction);
                            clearInterval(successInterval);
                        }
                    }, 20000);
                    msg.channel.send(msgTransaction['code'] + msgTransaction['id'] + theta + this.botInfo['ACK']);
                    msg.channel.send(msgTransaction['code'] + msgTransaction['id'] + theta + this.botInfo['SYN']);
                    msgTransaction['state'] = 'SYNACKSYN';
                }
            }
        });
        this.discordClient.on('ready', () => {
            this.emit('ready')
        });
    }

    addBot(guildID, channelID, botInfo) {
        this.bots.push({
            'serverID': guildID,
            'channelID': channelID,
            'botInfo': botInfo
        });
    }

    getInfo() {
        return this.botInfo;
    }

    send(id, messageToSend, cb) {
        var bot = this.bots.find(b => { return b['botInfo']['ID'] == id });

        if (typeof bot === 'undefined') {
            throw ('Bot not in list: ' + id);
        }
        var server = this.discordClient.guilds.cache.get(bot['serverID']);
        if (typeof server === 'undefined') {
            throw ('Server cannot be found: ' + id);
        }
        var communicationChannel = server.channels.cache.get(bot['channelID']);
        var transactionCode = (1000000 + Math.floor(Math.random() * 999999)).toString();
        communicationChannel.send(transactionCode + id.toString() + theta + this.botInfo['SYN']);
        var msgTransaction = {
            'code': transactionCode,
            'id': id,
            'state': 'SYN',
            'messageToSend': messageToSend,
        };
        this.outgoingMessages.push(msgTransaction);

        var successInterval = setInterval(() => {
            if (msgTransaction['state'] == 'SUCCESS') {
                cb(true);
                clearInterval(successInterval);
            }
        }, 1000);
        var failureTimeout = setTimeout(() => {
            if (msgTransaction['state'] != 'SUCCESS') {
                cb(false);
                clearInterval(successInterval);
            }
        }, 20000);
    }
}