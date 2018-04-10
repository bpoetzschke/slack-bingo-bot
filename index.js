"use strict";

var Botkit = require('botkit'),
    joinAndCommas = require('./joinAndComma'),
    emoji = "boom",
    react = require('./react'),
    insult = require('./insult'),
    noop = () => undefined,
    PERSIST_BINGO_WORDS = process.env.PERSIST_BINGO_WORDS && process.env.PERSIST_BINGO_WORDS != 0,
    spawnedBot, controller = Botkit.slackbot({
        retry: Infinity,
        logLevel: 3
    });

var botController = require('./bot'),
    validator = require('./validator'),
    wordManager = require('./wordManager').getInstance();

//---------------------------
// Global functions
//---------------------------

function attachmentGif(w) {
    return {
        fallback: `There was a GIF here: ${w.word}`,
        color: "#36a64f",
        image_url: w.gif
    }
}

//---------------------------
// Business logic functions (can be extracted as module later on)
//---------------------------

function handleAmbient(bot, message) {
    if (message.type == 'message') {

        // validate message
        let valid = validator.validate(message.text)
        if (valid < 1) {

            react(bot, "enton", message, noop);
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
        } else {

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
                wordManager.tickWords(found, message.user);

                let foundStr = joinAndCommas(found.map(w => w.word))
                react(bot, emoji, message, noop)
                let poser = found.map(w => w.addedBy ? `<@${w.addedBy}>` : '').join(' ')
                bot.reply(message, {
                    username: 'bingo',
                    text: `Bingo! <@${message.user}> said ${foundStr}! There are ${wordManager.getWords().length || "no"} bingo words left to discover! ${poser}`,
                    icon_emoji: `:${emoji}:`,
                    attachments: found.filter(w => w.gif).map(attachmentGif)
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
    }
}

function exitHandler() {
    persistence.save(words, foundWords, function (err) {
        if (err) {
            throw err;
        } else {
            console.log('Wordlist and found words saved successfully.');
            process.exit(0);
        }
    });
    if (typeof spawnedBot.destroy === 'function') {
        spawnedBot.destroy();
    }
}

//---------------------------
// Event handler
//---------------------------

controller.hears('add', ['direct_message'], botController.handleAdd)

controller.hears('cheat', ['direct_message'], botController.handleCheat)

controller.hears(['hello', 'hi', 'introduce'], ['direct_message', 'direct_mention'], botController.introduce)

controller.on('ambient', handleAmbient)

controller.on('bot_channel_join', botController.introduce)

//---------------------------

//catches ctrl+c event
process.on('SIGINT', exitHandler);

// connect the bot to a stream of messages
controller.spawn({
    token: process.env.SLACK_TOKEN
}).startRTM((err, b, payload) => {
    if (err) throw err
    spawnedBot = b;
})

// Hack: Make functions available for testing
exports.handleAmbient = handleAmbient
