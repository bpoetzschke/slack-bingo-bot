var validator = require('../validator');

describe("Bingos message validation behaviour", function () {
    it("should accept full sentences", function () {
      expect(validator.validate("This is a sentence.")).toBe(1);
      expect(validator.validate("Sentence.")).toBe(-1);
      expect(validator.validate("blue cheese won't fit")).toBe(-1);
      expect(validator.validate(":cow: test.")).toBe(1);
    });
    it("should accept multiple sentences", function () {
      expect(validator.validate("This is a text. But it has another sentence.")).toBe(1);
      expect(validator.validate("Bingo Dredd is the law. Valerio. MacGyver. Steven Seagal. Beer. Kaka in der Kopf.")).toBe(0);
    });
  });  
