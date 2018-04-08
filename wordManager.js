"use strict";

var instance = null,
    Promise = require('bluebird'),
    giphy = require('./giphy'),
    persistence = require('./persistence'),
    readFile = Promise.promisify(require("fs").readFile),
    foundWords = [],
    words = [];

var wordManager = (function() {
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
        })
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

    function init() {
        loadWords();
    }

    init();

    return {
        getWords: function() {
            return words;
        },
    
        getFoundWords: function() {
            return foundWords;
        },
    
        markWordAsFound: function(word) {
            //somehow we try to insert two occourences of the found word but one has a undefined user. so we just don't insert the one without user defined.
            if(!(word.user === undefined)) {
                foundWords.push(word);
            }
        },

        tickWords: function(wordsToTick) {
            wordsToTick.forEach( w => {
                if (words.indexOf(w) >= 0) {
                    words.splice(words.indexOf(w), 1);
                    foundWords.push(w);
                }
            });
        },
    }
});

function getInstance() {
    if (!instance) {
        instance = wordManager();
    }

    return instance;
}

module.exports = {
    getInstance: getInstance,
};
