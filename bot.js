"use strict";

var Botkit = require('botkit'),
    react = require('./react'),
    wordManager = require('./wordManager'),
    validator = require('./validator'),
    joinAndCommas = require('./joinAndComma'),
    insult = require('./insult'),
    emoji = "boom",
    spawnedBot, controller = null;

function handleAdd(bot, message) {
    //We need to extract single words and quoted words
    message.text.match(/(?:"([^"]+)"|([^"\s]+))/g).splice(1).forEach(w => {
        if (addWord(w, message.user)) {
            bot.reply(message, {
                text: 'Added ' + w,
                icon_emoji: `:${emoji}:`
            });
            react(bot, 'thumbsup', message)
        }
    })
}

function handleCheat(bot, message) {
    react(bot, 'wink', message)
    bot.reply(message, wordManager.getWords().map(w => w.word).join(', '))
}

function introduce(bot, message) {
    react(bot, 'thumbsup', message)
    bot.reply(message, {
        text: 'Let\'s play BINGO:exclamation: Be the first to send any of my secret magic words and win:trophy:\n' +
            `Suggest secret words by sending <@${botUid}> a private message:love_letter: starting with *add*\n` +
            'e.g. `add :cake: "big data" landslide` to add :cake:, landslide and big data as bingo words',
        icon_emoji: `:${emoji}:`,
        username: 'bingo'
    });
}

function handleAmbient(bot, message) {
    if (message.type == 'message') {

        // validate message
        let valid = validator.validate(message.text)
        if (valid < 1) {
            handleInvalidMessage(bot, message, valid);
        } else {
            handleValidMessage(bot, message);
        }
    }
}

function handleInvalidMessage(bot, message, valid) {
    react(bot, "enton", message);
    bot.api.users.info({user:message.user}, (err, res) => {
        let username = 'Douchbag'
        if (!err) {
            username = `<@${message.user}>`;
        }
        
        let insulttext = insult.generate(username);
        let replyText = `Sorry `;
        if (valid === 0) {
            replyText += `something in your message seems to be not a sentence: ${insulttext}`;
        } else {
            replyText += `that's not a sentence: ${insulttext}`;
        }
        console.log(replyText);
        bot.reply(message, {
            username: 'bingo',
            text: replyText,
            icon_emoji: `:anton:`
        })
    })
}

function attatchGif(w) {
    return {
        fallback: `There was a GIF here: ${w.word}`,
        color: "#36a64f",
        image_url: w.gif
    }
}

function handleValidMessage(bot, message) {
    //search text for bingo word
    let found = []
    wordManager.getWords().filter(w => {
        if (w.addedBy != message.user && w.regExp.test(message.text)) {
            found.push(w);
        }
        return false
    })

    var alreadyFound = wordManager.getFoundWords().filter(fw => {
        if (fw.regExp.test(message.text)) {
            return true;
        }

        return false;
    });

    if (found.length) {
        wordManager.tickWords(found.map(w => w.word), message.user);
        let foundStr = joinAndCommas(found.map(w => w.word))
        react(bot, emoji, message)
        bot.reply(message, {
            username: 'bingo',
            text: `Bingo! <@${message.user}> said ${foundStr}! There are ${wordManager.getWords().length || "no"} bingo words left to discover!`,
            icon_emoji: `:${emoji}:`,
            attachments: found.filter(w => w.gif).map(attatchGif)
        });
    }

    if (alreadyFound.length) {
        let foundStr = joinAndCommas(alreadyFound.map(w => {
            if (w != undefined) {
                return w.word;
            }
        }));

        bot.reply(message, {
            username: 'bingo',
            text: `The following words were already bingoed: ${foundStr}`,
            icon_emoji: `:${emoji}:`
        });
    }
}

function setCallbacks() {
    controller.hears('add', ['direct_message'], handleAdd)
    controller.hears(['hello', 'hi', 'introduce'], ['direct_message', 'direct_mention'], introduce)
    controller.hears('cheat', ['direct_message'], handleCheat)
    controller.on('ambient', handleAmbient)
    controller.on('bot_channel_join', introduce)
}

function init() {
    spawnedBot, controller = Botkit.slackbot({
        retry: Infinity,
        logLevel: 3
    });

    setCallbacks();
}

function spawn() {
    // connect the bot to a stream of messages
    controller.spawn({
        token: process.env.SLACK_TOKEN
    }).startRTM((err, b, payload) => {
        if (err) throw err
        spawnedBot = b;
    })
}

module.exports = {
    init,
    spawn,
    handleAmbient
};
