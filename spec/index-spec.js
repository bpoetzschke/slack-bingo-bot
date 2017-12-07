var index = require("../index");

describe("Bingos message validation behaviour", function () {
  it("should accept full sentences", function () {
    expect(index.containsValidSentences("This is a sentence.")).toBe(1);
    expect(index.containsValidSentences("Sentence.")).toBe(-1);
    expect(index.containsValidSentences("blue cheese won't fit")).toBe(-1);
  });
  it("should accept multiple sentences", function () {
    expect(index.containsValidSentences("This is a text. But it has another sentence.")).toBe(1);
    expect(index.containsValidSentences("Bingo Dredd is the law. Valerio. MacGyver. Steven Seagal. Beer. Kaka in der Kopf.")).toBe(0);
  });
});  

describe("Bingos ambient accepting behaviour", function() {
  it("should insult on wrong sentences", function() {
    let testMsg = {
      "type": "message",
      "text": "blue cheese won't fit",
      "user": "12345"
    };
    let bot = {
      api: {
        users: {
          info: (userIdObj, cb) => {
            expect(userIdObj.user).toBe("12345");
            console.log(cb);
            cb(null, {
              user: {
                name: "TestMac"
              }
            });
          }
        }
      },
      reply: (msg, res) => {
        expect(msg).toBe(testMsg);
        expect(res.username).toBe('bingo');
        expect(res.text).toContain('Sorry that\'s not a sentence:');
        expect(res.icon_emoji).toBe(':anton:');
      }
    };
    index.handleAmbient(bot, testMsg);
  })
})