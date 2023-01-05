import fs from "fs";
import path from "path";
import EasyGraphQLTester from "easygraphql-tester";
import { mutation } from "mutations/Project/createProject";

const schemaCode = fs.readFileSync(
  path.join(__dirname, "../../../schema", "schema.graphql"),
  "utf8"
);

const mutationString = (mutation as any).default.params.text;

describe("createProject mutation", () => {
  let tester;
  beforeEach(() => {
    tester = new EasyGraphQLTester(schemaCode);
  });

  it("Should throw an error if given the incorrect input", () => {
    let error;
    try {
      tester.mock(mutationString, {
        input: {
          someKey: {
            someOtherKey: "123",
          },
        },
      });
    } catch (error_) {
      error = error_;
    }

    expect(error.message).toEqual(
      'Variable "$input" got invalid value { someKey: { someOtherKey: "123" } }; Field "fundingStreamRpfId" of required type "Int!" was not provided.'
    );
  });

  it("Should return a string relay ID if valid", () => {
    const test = tester.mock(mutationString, {
      input: { fundingStreamRpfId: 1 },
    });

    expect(test).toBeDefined();
    expect(typeof test.data.createProject.projectRevision.id).toBe("string");
  });
});
