var wordManager = require('../wordManager'),
    sinon = require('sinon'),
    Promise = require('bluebird'),
    nodeFs = require('fs'),
    localFs = require('../fs');

describe("wordManager works as expected", function(){
    it("should initialize with empty word and empty found word list", function() {
        expect(wordManager.getFoundWords().length).toBe(0);
        expect(wordManager.getWords().length).toBe(0);
    });

    it("loads initial.txt when no save.json exists.", function(done){
        nodeReadFileStub = sinon.stub(nodeFs, "readFile");
        localReadFileStub = sinon.stub(localFs, "readFile");
        localReadFileStub.usingPromise(Promise).resolves("toast\n\rhawai");
        wordManager.init();

        let savedCallArgs = nodeReadFileStub.getCall(0).args;

        expect(savedCallArgs[0]).toEqual("save.json");
        expect(savedCallArgs[1]).toEqual("utf8");
        expect(typeof savedCallArgs[2]).toEqual("function");

        savedCallArgs[2]({}, null);

        Promise.delay(500).then(() => {
            expect(wordManager.getFoundWords().length).toBe(0);
            expect(wordManager.getWords().length).toBe(2);
            done();
        });
    });
});
