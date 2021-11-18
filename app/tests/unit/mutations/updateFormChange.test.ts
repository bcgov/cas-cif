import fs from "fs";
import path from "path";
import EasyGraphQLTester from "easygraphql-tester";
import { mutation } from "mutations/FormChange/updateFormChange";

const schemaCode = fs.readFileSync(
  path.join(__dirname, "../../../server", "schema.graphql"),
  "utf8"
);

const mutationString = (mutation as any).default.params.text;

describe("UpdateFormChange mutation", () => {
  let tester;
  beforeEach(() => {
    tester = new EasyGraphQLTester(schemaCode);
  });
  it("Should throw an error if input is missing", () => {
    let error;
    try {
      tester.mock(mutationString);
    } catch (error_) {
      error = error_;
    }

    expect(error.message).toEqual(
      'Variable "$input" of required type "UpdateFormChangeInput!" was not provided.'
    );
  });
  it("Should throw an error if a required variable is missing", () => {
    let error;
    try {
      tester.mock(mutationString, {
        input: {
          formChange: {
            id: 'abc'
          },
        },
      });
    } catch (error_) {
      error = error_;
    }

    expect(error.message).toEqual(
      'Variable "$input" got invalid value { formChange: { id: "abc" } }; Field "formChangePatch" of required type "FormChangePatch!" was not provided.'
    );
  });
  it("Should return a string relay ID if valid", () => {
    const test = tester.mock(mutationString, {
      input: {
        id: 'abc',
        formChangePatch: {
          newFormData: {
            cif_identifier: 'test',
            description: 'test'
          }
        }
      },
    });

    expect(test).toBeDefined();
    expect(typeof test.data.updateFormChange.formChange.id).toBe(
      "string"
    );
  });
  it("Should return newFormData if valid", () => {
    const test = tester.mock(mutationString, {
      input: {
        id: 'abc',
        formChangePatch: {
          newFormData: {
            cif_identifier: 'test',
            description: 'test'
          }
        }
      },
    });

    expect(test).toBeDefined();
    expect(test.data.updateFormChange.formChange.newFormData).toBeDefined();
  });
});
