"use strict";

var botController = require('./bot'),
    wordManager = require('./wordManager');

botController.init();
botController.spawn();
wordManager.init();
