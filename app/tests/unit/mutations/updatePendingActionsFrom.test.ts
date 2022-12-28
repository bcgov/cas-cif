import fs from "fs";
import path from "path";
import EasyGraphQLTester from "easygraphql-tester";
import { mutation } from "mutations/ProjectRevision/updatePendingActionsFrom";

const schemaCode = fs.readFileSync(
  path.join(__dirname, "../../../schema", "schema.graphql"),
  "utf8"
);

const mutationString = (mutation as any).default.params.text;

describe("updatePendingActionsFromMutation mutation", () => {
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
      'Variable "$input" of required type "UpdateProjectRevisionInput!" was not provided.'
    );
  });

  it("Should throw an error if a required variable is missing", () => {
    let error;
    try {
      tester.mock(mutationString, {
        input: {
          badVariable: 897,
        },
      });
    } catch (error_) {
      error = error_;
    }

    expect(error.message).toEqual(
      'Variable "$input" got invalid value { badVariable: 897 }; Field "id" of required type "ID!" was not provided.'
    );
  });

  it("Should return a role (Director, Ops Team, Tech Team, or Proponent) if valid", () => {
    const test = tester.mock(mutationString, {
      input: {
        id: "123",
        projectRevisionPatch: {
          pendingActionsFrom: "Director",
        },
      },
    });

    expect(test).toBeDefined();
    expect(
      test.data.updateProjectRevision.projectRevision.pendingActionsFrom
    ).toBeDefined();
  });
});
