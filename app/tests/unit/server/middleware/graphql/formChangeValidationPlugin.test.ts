import {
  filter,
  resolverWrapperGenerator,
} from "server/middleware/graphql/formChangeValidationPlugin";
import validateRecord from "server/middleware/graphql/validateRecord";
import { mocked } from "jest-mock";

jest.mock("server/middleware/graphql/validateRecord");
const mockResolver = jest.fn();

jest.mock("data/jsonSchemaForm/validationSchemas", () => ({
  some_schema_name: { prop: "string", required: ["prop"] },
}));

jest.mock("server/middleware/graphql/databaseSchemaConfiguration", () => [
  "database_schema",
]);

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

  it("Has a filter method that returns an empty object for the updateMilestoneFormChange custom mutation", () => {
    const testContext = {
      scope: {
        isRootMutation: true,
        fieldName: "updateMilestoneFormChange",
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

  it("Validates the form data with the schema which name is on the record, when the schema is not in the database", async () => {
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
    expect(mockValidationFunction).toHaveBeenCalledWith(
      { prop: "string", required: ["prop"] },
      {
        column: "value",
      }
    );
    expect(mockResolver).toHaveBeenCalledTimes(1);
    expect(mockResolver).toHaveBeenCalledWith(
      {},
      expect.anything(), //testing this in the next test
      testContext,
      {}
    );
  });
  it("Validates the form data with the schema fetched from the database", async () => {
    const mockValidationFunction = jest.fn();
    mocked(validateRecord).mockImplementation(mockValidationFunction);

    const mockPgContext = {
      pgClient: {
        query: jest
          .fn()
          // Once to fetch the schema name
          .mockReturnValueOnce({
            rows: [{ json_schema_name: "database_schema" }],
          })
          // Once to fetch the schema from the database
          .mockReturnValueOnce({
            rows: [{ json_schema: { schema: { fake_schema: true } } }],
          }),
      },
    };

    const wrappedResolverUnderTest = resolverWrapperGenerator();

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
      mockPgContext,
      {} as any
    );

    expect(mockValidationFunction).toHaveBeenCalledTimes(1);
    expect(mockValidationFunction).toHaveBeenCalledWith(
      { fake_schema: true },
      {
        column: "value",
      }
    );
    expect(mockResolver).toHaveBeenCalledTimes(1);
    expect(mockResolver).toHaveBeenCalledWith(
      {},
      expect.anything(), //testing this in the next test
      mockPgContext,
      {}
    );
  });
  it("Throws when the schema is not found neither in the database nor in the static validation schemas", async () => {
    const mockValidationFunction = jest.fn();
    mocked(validateRecord).mockImplementation(mockValidationFunction);

    const testContext = getMockContext("non_existent_schema");

    const wrappedResolverUnderTest = resolverWrapperGenerator();

    await expect(
      wrappedResolverUnderTest(
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
      )
    ).rejects.toThrowWithMessage(
      Error,
      "No json schema found for schema with name non_existent_schema"
    );
  });
  it("Adds the validation errors to the mutation arguments when calling the postgraphile resolver", async () => {
    const mockValidationFunction = jest
      .fn()
      .mockReturnValue([{ error: "mock error" }]);
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
