"use strict";

var react = require('./react'),
    wordManager = require('./wordManager');

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
    bot.reply(message, wordManager.getInstance().getWords().map(w => w.word).join(', '))
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

module.exports = {
    handleAdd,
    handleCheat,
    introduce
};
