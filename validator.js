"use strict";

var sentenceMatcher = /((\b[\w\s,'_-]+)[…\.?!]+)/g; // Verify at https://regex101.com/r/t4OJoa/1

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

module.exports = {
    validate: containsValidSentences
}
