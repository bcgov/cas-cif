import { TextFilter } from "components/Table/Filters";

const optionUnderTest = new TextFilter("displayText", "column");

describe("the text search option", () => {
  it("converts any input to string", () => {
    expect(optionUnderTest.castValue).toBeDefined();

    expect(optionUnderTest.castValue("string")).toEqual("string");
    expect(optionUnderTest.castValue(123)).toEqual("123");
  });
});
