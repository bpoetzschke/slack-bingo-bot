"use strict";

var Botkit = require('botkit'),
    giphy = require('./giphy'),
    joinAndCommas = require('./joinAndComma'),
    Promise = require('bluebird'),
    readFile = Promise.promisify(require("fs").readFile),
    emoji = "boom",
    react = require('./react'),
    insult = require('./insult'),
    noop = () => undefined,
    PERSIST_BINGO_WORDS = process.env.PERSIST_BINGO_WORDS && process.env.PERSIST_BINGO_WORDS != 0,
    botUid, words = [],
    foundWords = [],
    persistence = require('./persistence'),
    bot, controller = Botkit.slackbot({
        logLevel: 3
            //debug: true
            //include "log: false" to disable logging
            //or a "logLevel" integer from 0 to 7 to adjust logging verbosity
    }),
    sentenceMatcher = /((\b[\w\s,'_-]+)[…\.?!]+)/g; // Verify at https://regex101.com/r/t4OJoa/1

//---------------------------
// Global functions
//---------------------------

function safeRegex(s) {
    //  . [ ] \ * + { } ? -
    return s.replace(/[\.\[\]\\*+{}?\-]/g, x => '\\' + x)
}

// hit matches hittings hitters hitting hitter hitted hited hiting hiter hiters hitings
function makeRegex(s) {
    if (/^\w.*\w$/i.test(s))
        return new RegExp(`\\b${safeRegex(s)}${safeRegex(s[s.length-1])}?(ings?|ers?|ed|s)?\\b`, "i")
            //Also work with :cow:
    let beginWordBreak = /^\b/.test(s) ? "\\b" : ""
    let endWordBreak = /\b$/.test(s) ? "\\b" : ""
    return new RegExp(beginWordBreak + safeRegex(s) + endWordBreak, "i")
}

/**
 * Returns -1 if input message does not conatin any sentence.
 * Returns  0 if input message contains at least one sentence which is to short.
 * Returns  1 if input message is valid. 
 */
function containsValidSentences(message) {
    //first replace all emoji's to not confuse sentence mathcer
    let replacedMsg = message.replace(/\:(.*?)\:/g, "emoji");
    // Enforce the syntactic of a sentence
    let sentences = replacedMsg.match(sentenceMatcher);
    // Enforce minimum word count in any matched sentence
    if (sentences) {
        for (let s = 0; s < sentences.length; s++) {
            if (sentences[s].split(/\s+/).length < 2) {
                if (sentences.length > 1) {
                    return 0;
                }
                return -1;
            }
        }
        return 1;
    } else {
        return -1;
    }
}

function addWord(toAdd, addedBy) {
    toAdd = toAdd.trim().toLowerCase()
        .replace(/(^"|"$)/g, '') //Surrounding quotes
        .replace(/(,|;)\s/g, '') //Separators
        //Check for duplicates
    for (let w of words) {
        if (w.word == toAdd)
            return false
    }
    console.log("Adding", toAdd)
    let word = {
        word: toAdd,
        regExp: makeRegex(toAdd),
        addedBy: addedBy
    }
    words.push(word)
    return giphy.randomRetryFirstWord(word.word).then(data => {
        if (data.fixed_height_downsampled_url) {
            word.gif = data.fixed_height_downsampled_url
        }
    }).catch(noop)
}

function attachmentGif(w) {
    return {
        fallback: `There was a GIF here: ${w.word}`,
        color: "#36a64f",
        image_url: w.gif
    }
}

function loadWords() {
    persistence.load(function (remainingWords, bingoedWords, err) {
        if (err == undefined) {
            console.log('Loaded saved words successfully');
            foundWords = bingoedWords.filter(w => {
                w.regExp = makeRegex(w.word);
                return true;
            });
            words = remainingWords.filter(w => {
                w.regExp = makeRegex(w.word);
                return true;
            });
        } else {
            console.log("Load words from initial.txt");
            readFile('initial.txt', 'utf8').then(txt => {
                Promise.map(txt.split(/[\n\r]+/), w => addWord(w), {
                    concurrency: 5
                })
            })
        }
    });
}

function introduce(bot, message) {
    react(bot, 'thumbsup', message, noop)
    bot.reply(message, {
        text: 'Let\'s play BINGO:exclamation: Be the first to send any of my secret magic words and win:trophy:\n' +
            `Suggest secret words by sending <@${botUid}> a private message:love_letter: starting with *add*\n` +
            'e.g. `add :cake: "big data" landslide` to add :cake:, landslide and big data as bingo words',
        icon_emoji: `:${emoji}:`,
        username: 'bingo'
    });
}

//---------------------------
// Business logic functions (can be extracted as module later on)
//---------------------------

function handleAmbient(bot, message) {
    if (message.type == 'message') {

        // validate message
        let valid = containsValidSentences(message.text)
        if (valid < 1) {

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
            words = words.filter(w => {
                if (w.addedBy != message.user && w.regExp.test(message.text)) {
                    found.push(w)

                    return PERSIST_BINGO_WORDS
                }
                return true
            })

            var alreadyFound = foundWords.filter(fw => {
                if (fw.regExp.test(message.text)) {
                    return true;
                }

                return false
            });

            if (found.length) {

                found.map(f => {
                    foundWords.push({
                        word: f.word,
                        usr: message.user,
                        regExp: f.regExp
                    })
                });

                let foundStr = joinAndCommas(found.map(w => w.word))
                react(bot, emoji, message, noop)
                let poser = found.map(w => w.addedBy ? `<@${w.addedBy}>` : '').join(' ')
                bot.reply(message, {
                    username: 'bingo',
                    text: `Bingo! <@${message.user}> said ${foundStr}! There are ${words.length || "no"} bingo words left to discover! ${poser}`,
                    icon_emoji: `:${emoji}:`,
                    attachments: found.filter(w => w.gif).map(attachmentGif)
                })
            }

            if (alreadyFound.length) {
                let foundStr = joinAndCommas(alreadyFound.map(w => {
                    if (w != undefined) {
                        return w.word
                    }
                }));

                bot.reply(message, {
                    username: 'bingo',
                    text: `The following words were already bingoed: ${foundStr}`,
                    icon_emoji: `:${emoji}:`
                })
            }
        }
    }
} 

function handleAdd(bot, message) {
    //We need to extract single words and quoted words
    message.text.match(/(?:"([^"]+)"|([^"\s]+))/g).splice(1).forEach(w => {
        if (addWord(w, message.user)) {
            bot.reply(message, {
                text: 'Added ' + w,
                icon_emoji: `:${emoji}:`
            });
            react(bot, 'thumbsup', message, noop)
        }
    })
}

function handleCheat(bot, message) {
    react(bot, 'wink', message, noop)
    bot.reply(message, words.map(w => w.word).join(', '))
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
    if (typeof bot.destroy === 'function') {
        bot.destroy(bot);
    }
}

//---------------------------
// Event handler
//---------------------------

controller.hears('add', ['direct_message'], handleAdd)

controller.hears('cheat', ['direct_message'], handleCheat)

controller.hears(['hello', 'hi', 'introduce'], ['direct_message', 'direct_mention'], introduce)

controller.on('ambient', handleAmbient)

controller.on('bot_channel_join', introduce)

//---------------------------

//catches ctrl+c event
process.on('SIGINT', exitHandler);

// connect the bot to a stream of messages
controller.spawn({
    token: process.env.SLACK_TOKEN
}).startRTM((err, b, payload) => {
    if (err) throw err
    botUid = payload.self.id
    bot = b;
})

loadWords();

// Hack: Make functions available for testing
exports.containsValidSentences = containsValidSentences;
exports.handleAmbient = handleAmbient
