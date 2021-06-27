
# discord-communications

  

A communication system for node.js that can be watched via discord.

## Table of Contents

- [About](#About)

- [Example](#Example)

- [Usage](#Usage)

- [Contributing](#Contributing)

  
  

## About

Was a bit bored and wanted to make a funny communication system, so... I did. Its modeled after [TCP connections](https://www.khanacademy.org/computing/computers-and-internet/xcae6f4a7ff015e7d:the-internet/xcae6f4a7ff015e7d:transporting-packets/a/transmission-control-protocol--tcp).

  

## Example

  

```

discordComms = require("discord-communications");

require("dotenv/config");

client1 = new discordComms(
  process.env.CLIENT1_TOKEN,
  "855942709217984512",
  "Sync",
  "Ack",
  "Fin",
  "================================="
);

client1.addBot("818229925517590558", "857739636850556948", {
  ID: "855867486871486496",

  SYN: "sYNC",

  ACK: "aCK",

  FIN: "fIN",
});

client1.on("message", (m) => {
  console.log("Client1 received a message!");

  console.log(JSON.parse(m["message"]));
});

client1.on("messageFailed", (m) => {
  console.log(m);
});

client2 = new discordComms(
  process.env.CLIENT2_TOKEN,
  "855867486871486496",
  "sYNC",
  "aCK",
  "fIN",

  ":grinning: :grinning: :grinning: :grinning: :grinning: :grinning:"
);

client2.addBot("818229925517590558", "857739636850556948", {
  ID: "855942709217984512",

  SYN: "Sync",

  ACK: "Ack",

  FIN: "Fin",
});

const veryLargeObject = [
  [
    true,

    206524755.7646594,

    "watch",

    {
      recent: 1919212481.4359708,

      of: -1234194671,

      job: "fireplace",

      fastened: "tongue",

      prepare: [false, 422601777.6562691, "tower", "powerful", true],
    },

    [false, 83278634.86709356, 1508958168.5165505, false, false],
  ],
];

client2.on("ready", () => {
  client2.send("855942709217984512", veryLargeObject, (sc) => console.log(sc));
});


```

  

Discord:

  

![](https://cdn.discordapp.com/attachments/857739636850556948/858464231455326229/unknown.png)

  
  

Console:

  

![enter image description here](https://cdn.discordapp.com/attachments/857739636850556948/858465089199145010/unknown.png)

  

## Usage

Use the installation command:

`npm i --save discord-communications`

  

Client:

Methods:

- constructor: `client = discordComms(params)` Creates the client object.

- token: The discord bots token

- id: The bots Client ID.

- SYN: The message the bot will send to synchronize.

- ACK: The message the bot will send to acknowledge.

- FIN: The message the bot will send to finish.

- separator: The message that the bot will send after a successful transaction to separate transactions on the Discord Chat.

- getInfo: `client.getInfo()`Returns an object containing the ID, SYN, ACK, FIN information of the client.

- addBot: `client.addBot(params)` Adds a bot that the client will communicate with.

- guildID: The ID of the server/guild in which the client will communicate with the bot.

- channelID: The ID of the channel in which the client will send messages to the bot.

- botInfo: An object containing the ID, SYN, ACK, FIN properties of the bot.

- send: `client.send(params)` Sends a message to a bot

- id: The Client ID of the bot you want to send a message to.

- messageToSend: The message/object you want to send to the Bot.

- cb: The callback after the message is sent successfully/unsuccessfully. Passes a value of `true` if the message is successfully sent or `false` if the message is sent unsuccessfully.

  

Events:

- message: `client.on("message", function)` When the client recieves a message

- message: An object containing information about the transaction.

- code: The transaction code(The code that separates transactions from one another).

- id: The ID of the sender

- state: The state of the message

- message: A string with the object sent.

- messageFailed: `client.on("messageFailed", function)` When the client failed to recieve a message.

- message: An object containing information about the transaction.

- code: The transaction code(The code that separates transactions from one another).

- id: The ID of the sender

- state: The state of the message

- message: A string with the object sent.

- ready: `client.on("ready", function)`When the discord client of the bot is ready.

  
  

## Contributing

This is my first nodejs package, so feel free to make suggestions, and help me fix convention errors.