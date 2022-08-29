import {
  filter,
  resolverWrapperGenerator,
} from "server/middleware/graphql/formChangeValidationPlugin";
import validateRecord from "server/middleware/graphql/validateRecord";
import { mocked } from "jest-mock";

jest.mock("server/middleware/graphql/validateRecord");
const mockResolver = jest.fn();

const getMockContext = (mockedSchemaName?: string) => {
  return {
    pgClient: {
      query: jest.fn().mockReturnValue({
        rows: [{ json_schema_name: mockedSchemaName ?? "mock_schema_name" }],
      }),
    },
  };
};

describe("The postgraphile form validation plugin", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("Has a filter method that returns an empty object for the updateFormChange mutation", () => {
    const testContext = {
      scope: {
        isRootMutation: true,
        fieldName: "updateFormChange",
      },
    };

    expect(filter(testContext)).toEqual({});
  });

  it("Has a filter method that returns an empty object for the stageFormChange mutation", () => {
    const testContext = {
      scope: {
        isRootMutation: true,
        fieldName: "stageFormChange",
      },
    };

    expect(filter(testContext)).toEqual({});
  });

  it("Has a filter method that returns an empty object for the commitFormChange mutation", () => {
    const testContext = {
      scope: {
        isRootMutation: true,
        fieldName: "commitFormChange",
      },
    };

    expect(filter(testContext)).toEqual({});
  });
  it("Has a filter method that returns undefined if the operation is not a mutation", () => {
    const testContext = {
      scope: {
        isRootMutation: false,
        fieldName: "updateFormChange",
      },
    };

    expect(filter(testContext)).toBeNull();
  });
  it("Has a filter method that returns undefined if the mutation is not updateFormChange | stageFormChange | commitFormChange", () => {
    const testContext = {
      scope: {
        isRootMutation: true,
        fieldName: "updateSomeOtherTable",
      },
    };

    expect(filter(testContext)).toBeNull();
  });

  it("Calls the postgraphile resolver with no arguments if there is no change to the form data", async () => {
    const wrappedResolverUnderTest = resolverWrapperGenerator();

    await wrappedResolverUnderTest(
      mockResolver,
      {},
      { input: { rowId: 1, formChangePatch: {} } },
      {},
      {} as any
    );

    expect(mockResolver).toHaveBeenCalledTimes(1);
    expect(mockResolver).toHaveBeenCalledWith();
  });

  it("Validates the form data with the schema which name is on the record", async () => {
    const mockValidationFunction = jest.fn();
    mocked(validateRecord).mockImplementation(mockValidationFunction);

    const wrappedResolverUnderTest = resolverWrapperGenerator();

    const testContext = getMockContext("some_schema_name");

    await wrappedResolverUnderTest(
      mockResolver,
      {},
      {
        input: {
          rowId: 1,
          formChangePatch: {
            newFormData: {
              column: "value",
            },
          },
        },
      },
      testContext,
      {} as any
    );

    expect(mockValidationFunction).toHaveBeenCalledTimes(1);
    expect(mockValidationFunction).toHaveBeenCalledWith("some_schema_name", {
      column: "value",
    });
    expect(mockResolver).toHaveBeenCalledTimes(1);
    expect(mockResolver).toHaveBeenCalledWith(
      {},
      expect.anything(), //testing this in the next test
      testContext,
      {}
    );
  });
  it("Adds the validation errors to the mutation arguments when calling the postgraphile resolver", async () => {
    const mockValidationFunction = jest
      .fn()
      .mockReturnValue([{ error: "mock error" }]);
    mocked(validateRecord).mockImplementation(mockValidationFunction);

    const wrappedResolverUnderTest = resolverWrapperGenerator();

    const testContext = getMockContext("schema_name");

    await wrappedResolverUnderTest(
      mockResolver,
      {},
      {
        input: {
          rowId: 1,
          formChangePatch: {
            newFormData: {
              column: "value",
            },
          },
        },
      },
      testContext,
      {} as any
    );

    expect(mockValidationFunction).toHaveBeenCalledTimes(1);
    expect(mockValidationFunction).toHaveBeenCalledWith("schema_name", {
      column: "value",
    });

    expect(mockResolver).toHaveBeenCalledTimes(1);
    expect(mockResolver).toHaveBeenCalledWith(
      {},
      {
        input: {
          rowId: 1,
          formChangePatch: {
            newFormData: {
              column: "value",
            },
            validationErrors: [{ error: "mock error" }],
          },
        },
      },
      testContext,
      {} as any
    );
  });
});
