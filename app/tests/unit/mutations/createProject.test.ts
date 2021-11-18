import fs from "fs";
import path from "path";
import EasyGraphQLTester from "easygraphql-tester";
import {mutation}  from "mutations/Project/createProject";

const schemaCode = fs.readFileSync(
  path.join(__dirname, "../../../server", "schema.graphql"),
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
          formChange: {
            cif_identifier: "123"
          },
        },
      });
    } catch (error_) {
      error = error_;
    }

    expect(error.message).toEqual(
      'Variable "$input" got invalid value { formChange: { cif_identifier: "123" } }; Field "formChange" is not defined by type "CreateProjectInput".'

    );
  });

  it("Should return a string relay ID if valid", () => {
    const test = tester.mock(mutationString, {
      input: {},
    });

    expect(test).toBeDefined();
    expect(typeof test.data.createProject.formChange.id).toBe(
      "string"
    );
  });

  it("Should return a newFormData object if valid", () => {
    const test = tester.mock(mutationString, {
      input: {},
    });

    expect(test).toBeDefined();
    expect(typeof test.data.createProject.formChange.newFormData).toBeDefined();
  });
});
