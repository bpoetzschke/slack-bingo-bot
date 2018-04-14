"use strict";

var persistence = require('../persistence'),
    sinon = require('sinon'),
    fs = require('fs');

describe('persistence', function () {
    it('should load file save.json when existing', function(done) {
        let readFileStub = sinon.stub(fs, "readFile");
        let exepctedFileContent = {
            remainingWords: ["toast", "hawai", "alaska"],
            bingoedWords: ["already", "bingoed"]
        };

        persistence.load((remainingWords, foundWords, err)=>{
            expect(err).toBeUndefined();
            expect(remainingWords).toEqual(exepctedFileContent.remainingWords);
            expect(foundWords).toEqual(exepctedFileContent.bingoedWords);

            done();
        });

        let args = readFileStub.getCall(0).args;
        expect(args[0]).toBe("save.json");
        expect(args[1]).toBe("utf8");
        expect(typeof args[2]).toBe("function");

        args[2](null, JSON.stringify(exepctedFileContent));

        readFileStub.restore();
    });

    it('should return error when trying to not existing file', function(done) {
        let readFileStub = sinon.stub(fs, "readFile");
        let testErr = new Error('I am a test error :)');

        persistence.load((remainingWords, foundWords, err)=>{
            expect(err).toBe(testErr);
            expect(remainingWords).toBeUndefined();
            expect(foundWords).toBeUndefined();

            done();
        });

        let args = readFileStub.getCall(0).args;
        expect(args[0]).toBe("save.json");
        expect(args[1]).toBe("utf8");
        expect(typeof args[2]).toBe("function");

        args[2](testErr, undefined);

        readFileStub.restore();
    });

    it('should save file', function(done) {
        let writeFileStub = sinon.stub(fs, "writeFile");
        let exepctedFileContent = {
            remainingWords: ["toast", "hawai", "alaska"],
            bingoedWords: ["already", "bingoed"]
        };

        persistence.save(exepctedFileContent.remainingWords, exepctedFileContent.bingoedWords, (err) => {
            expect(err).toBeUndefined();
            done();
        });

        let args = writeFileStub.getCall(0).args;
        expect(args[0]).toBe("save.json");
        expect(args[1]).toEqual(JSON.stringify(exepctedFileContent));
        expect(typeof args[2]).toBe("function");

        args[2](undefined);

        writeFileStub.restore();
    });

    it('should return error when save file failes', function(done) {
        let writeFileStub = sinon.stub(fs, "writeFile");
        let testErr = new Error("I am a test error ;)");
        let exepctedFileContent = {
            remainingWords: ["toast", "hawai", "alaska"],
            bingoedWords: ["already", "bingoed"]
        };

        persistence.save(exepctedFileContent.remainingWords, exepctedFileContent.bingoedWords, (err) => {
            expect(err).toBe(testErr);
            done();
        });

        let args = writeFileStub.getCall(0).args;
        expect(args[0]).toBe("save.json");
        expect(args[1]).toEqual(JSON.stringify(exepctedFileContent));
        expect(typeof args[2]).toBe("function");

        args[2](testErr);

        writeFileStub.restore();
    });
});
