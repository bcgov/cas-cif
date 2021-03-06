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

  it("Should not consume anything in the input", () => {
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
      'Variable "$input" got invalid value { someKey: { someOtherKey: "123" } }; Field "someKey" is not defined by type "CreateProjectInput".'
    );
  });

  it("Should return a string relay ID if valid", () => {
    const test = tester.mock(mutationString, {
      input: {},
    });

    expect(test).toBeDefined();
    expect(typeof test.data.createProject.projectRevision.id).toBe("string");
  });
});
