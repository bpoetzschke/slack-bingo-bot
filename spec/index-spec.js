var index = require("../index");

describe("Bingos accepting behaviour", function () {
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