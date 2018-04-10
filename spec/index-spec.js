var index = require("../index");

describe("Bingos ambient accepting behaviour", function() {
  it("should insult on wrong sentences", function() {
    let testMsg = {
      "type": "message",
      "text": "blue cheese won't fit",
      "user": "12345",
      "ts": 12345,
      "channel": "some_channel"
    };
    let bot = {
      api: {
        users: {
          info: (userIdObj, cb) => {
            expect(userIdObj.user).toBe("12345");
            cb(null, {
              user: {
                name: "TestMac"
              }
            });
          }
        },
        reactions: {
          add: (reaction, callback) => {
            expect(reaction).toBeDefined();
            expect(reaction.name).toBe("enton");
            expect(reaction.channel).toBe(testMsg.channel);
            expect(reaction.timestamp).toBe(testMsg.ts);
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
