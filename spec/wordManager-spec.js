var sinon = require('sinon'),
    Promise = require('bluebird'),
    persistence = require('../persistence'),
    fs = require('../fs');

describe("wordManager works as expected", function(){
    var persistenceLoadStub, readFileStub, wordManager;
    beforeEach(function(){
        persistenceLoadStub = sinon.stub(persistence, "load");
        readFileStub = sinon.stub(fs, "readFile");
        wordManager = require('../wordManager');
    });

    afterEach(function(){
        persistenceLoadStub.restore();
        readFileStub.restore();
        wordManager = null;
    });

    it("should initialize with empty word and empty found word list", function() {
        expect(wordManager.getFoundWords().length).toBe(0);
        expect(wordManager.getWords().length).toBe(0);
    });

    it("loads initial.txt when no persistence cannot load save.json.", function(done){
        readFileStub.usingPromise(Promise).resolves("toast\n\rhawai");
        wordManager.init();

        let persistenceLoadCallArgs = persistenceLoadStub.getCall(0).args;
        expect(persistenceLoadCallArgs.length).toBe(1);
        expect(typeof persistenceLoadCallArgs[0]).toEqual("function");

        // to tell the word manager that the persistence load method could not load the data we execute the callback
        // and tell pass as 3rd parameter a error
        persistenceLoadCallArgs[0]({}, {}, new Error("I am a test error ;)"));

        Promise.delay(500).then(() => {
            expect(wordManager.getFoundWords().length).toBe(0);
            expect(wordManager.getWords().length).toBe(2);
            done();
        });
    });

    it("should use data from persistence when load call was successfull and tick words.", function(done) {
        wordManager.init();
        let persistenceLoadCallArgs = persistenceLoadStub.getCall(0).args;
        expect(persistenceLoadCallArgs.length).toBe(1);
        expect(typeof persistenceLoadCallArgs[0]).toEqual("function");

        let remainingWords = [{
            word: "toast",
            regExp: "regex",
            addedBy: "jasmine-test"
        },{
            word: "hawai",
            regExp: "regex",
            addedBy: "jasmine-test"
        },{
            word: "alaska",
            regExp: "regex",
            addedBy: "jasmine-test"
        }];

        let foundWords = [{
            word: "already",
            usr: "jasmine-test",
            regExp: "regex",
            addedBy: "jasmine-test"
        }, {
            word: "already",
            usr: "jasmine-test",
            regExp: "regex",
            addedBy: "jasmine-test"
        }];

        // to tell the word manager that the persistence load method could not load the data we execute the callback
        // and tell pass as 3rd parameter a error
        persistenceLoadCallArgs[0](remainingWords, foundWords, undefined);

        expect(wordManager.getWords()).toEqual(remainingWords);
        expect(wordManager.getFoundWords()).toEqual(foundWords);

        wordManager.tickWords(["alaska"]);

        expect(wordManager.getWords().length).toEqual(remainingWords.length - 1);
        expect(wordManager.getFoundWords().length).toEqual(foundWords.length + 1);

        done();
    });
});
