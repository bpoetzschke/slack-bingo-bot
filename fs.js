var fs = require('fs'),
    Promise = require('bluebird');

function readFile(fileName, charSet) {
    return new Promise(function(resolve, reject) {
        fs.readFile(fileName, charSet, (err, data) => {
            if (err != null) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

module.exports = {
    readFile
};
