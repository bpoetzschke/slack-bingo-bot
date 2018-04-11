"use strict";

var botController = require('./bot'),
    wordManager = require('./wordManager');

// function exitHandler() {
//     persistence.save(words, foundWords, function (err) {
//         if (err) {
//             throw err;
//         } else {
//             console.log('Wordlist and found words saved successfully.');
//             process.exit(0);
//         }
//     });
//     if (typeof spawnedBot.destroy === 'function') {
//         spawnedBot.destroy();
//     }
// }

// //---------------------------

// //catches ctrl+c event
// process.on('SIGINT', exitHandler);

botController.init();
botController.spawn();
wordManager.init();
