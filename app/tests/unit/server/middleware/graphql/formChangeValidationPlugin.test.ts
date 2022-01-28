import {
  filter,
  resolverWrapperGenerator,
} from "server/middleware/graphql/formChangeValidationPlugin";

const getMockContext = (mockedSchemaName?: string) => {
  return {
    pgClient: {
      query: jest.fn().mockReturnValue({
        rows: [{ json_schema_name: mockedSchemaName ?? "mock_schema_name" }],
      }),
    },
  };
};

const getMockResolveInfo = (mockReturnedIdentifier?: number) => {
  return {
    graphile: {
      build: {
        getTypeAndIdentifiersFromNodeId: jest.fn().mockReturnValue({
          identifiers: [mockReturnedIdentifier ?? 123],
        }),
      },
    },
  } as any;
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
  it("Has a filter method that returns undefined if the operation is not a mutation", () => {
    const testContext = {
      scope: {
        isRootMutation: false,
        fieldName: "updateFormChange",
      },
    };

    expect(filter(testContext)).toBeNull();
  });
  it("Has a filter method that returns undefined if the mutation is not updateFormChange", () => {
    const testContext = {
      scope: {
        isRootMutation: true,
        fieldName: "updateSomeOtherTable",
      },
    };

    expect(filter(testContext)).toBeNull();
  });

  it("Calls the postgraphile resolver with no arguments if there is no change to the form data", async () => {
    const mockResolver = jest.fn();

    const wrappedResolverUnderTest = resolverWrapperGenerator();

    await wrappedResolverUnderTest(mockResolver, {}, {}, {}, {} as any);

    expect(mockResolver).toHaveBeenCalledTimes(1);
    expect(mockResolver).toHaveBeenCalledWith();
  });

  it("Validates the form data with the schema which name is on the record", async () => {
    const mockResolver = jest.fn();
    const mockValidationFunction = jest.fn();
    jest
      .spyOn(require("server/middleware/graphql/validateRecord"), "default")
      .mockImplementation(mockValidationFunction);

    const wrappedResolverUnderTest = resolverWrapperGenerator();

    const testContext = getMockContext("some_schema_name");
    const testResolveInfo = getMockResolveInfo();

    await wrappedResolverUnderTest(
      mockResolver,
      {},
      {
        input: {
          formChangePatch: {
            newFormData: {
              column: "value",
            },
          },
        },
      },
      testContext,
      testResolveInfo
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
      testResolveInfo
    );
  });
  it("Adds the validation errors to the mutation arguments when calling the postgraphile resolver", async () => {
    const mockResolver = jest.fn();
    const mockValidationFunction = jest
      .fn()
      .mockReturnValue([{ error: "mock error" }]);
    jest
      .spyOn(require("server/middleware/graphql/validateRecord"), "default")
      .mockImplementation(mockValidationFunction);

    const wrappedResolverUnderTest = resolverWrapperGenerator();

    const testContext = getMockContext("schema_name");
    const testResolveInfo = getMockResolveInfo();

    await wrappedResolverUnderTest(
      mockResolver,
      {},
      {
        input: {
          formChangePatch: {
            newFormData: {
              column: "value",
            },
          },
        },
      },
      testContext,
      testResolveInfo
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
          formChangePatch: {
            newFormData: {
              column: "value",
            },
            validationErrors: [{ error: "mock error" }],
          },
        },
      },
      testContext,
      testResolveInfo
    );
  });
});
