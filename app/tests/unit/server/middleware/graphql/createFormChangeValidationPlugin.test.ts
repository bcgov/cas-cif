import {
  filter,
  resolverWrapperGenerator,
} from "server/middleware/graphql/createFormChangeValidationPlugin";
import validateRecord from "server/middleware/graphql/validateRecord";
import { mocked } from "jest-mock";

jest.mock("server/middleware/graphql/validateRecord");
const mockResolver = jest.fn();

const defaultArgs = {
  input: {
    jsonSchemaName: "some_schema_name",
    newFormData: {
      column: "value",
    },
  },
};

describe("The postgraphile create form validation plugin", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("Has a filter method that returns an emptyobject for the createFormChange mutation", () => {
    const testContext = {
      scope: {
        isRootMutation: true,
        fieldName: "createFormChange",
      },
    };

    expect(filter(testContext)).toEqual({});
  });

  it("Has a filter method that returns undefined if the operation is not a root mutation", () => {
    const testContext = {
      scope: {
        isRootMutation: false,
        fieldName: "createFormChange",
      },
    };

    expect(filter(testContext)).toBeNull();
  });

  it("Has a filter method that returns undefined if the mutation is not createFormChange", () => {
    const testContext = {
      scope: {
        isRootMutation: true,
        fieldName: "createSomeOtherTable",
      },
    };

    expect(filter(testContext)).toBeNull();
  });

  it("has a resolver method that throws an error if the jsonSchemaName is not given in the input", async () => {
    const noSchemaArgs = {
      input: {
        formChangePatch: {
          newFormData: {
            column: "value",
          },
        },
      },
    };

    const wrappedResolverUnderTest = resolverWrapperGenerator();

    await expect(
      wrappedResolverUnderTest(mockResolver, {}, noSchemaArgs, {}, {} as any)
    ).rejects.toThrow("JSON schema must be set in the mutation input");
  });

  it("Validates the form data with the schema which name is on the record", async () => {
    const mockValidationFunction = jest.fn();
    mocked(validateRecord).mockImplementation(mockValidationFunction);
    const wrappedResolverUnderTest = resolverWrapperGenerator();

    await wrappedResolverUnderTest(
      mockResolver,
      {},
      defaultArgs,
      {},
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
      {},
      {} as any
    );
  });
  it("Adds the validation errors to the mutation arguments when calling the postgraphile resolver", async () => {
    const mockValidationFunction = jest
      .fn()
      .mockReturnValue([{ error: "mock error" }]);
    mocked(validateRecord).mockImplementation(mockValidationFunction);

    const wrappedResolverUnderTest = resolverWrapperGenerator();

    await wrappedResolverUnderTest(
      mockResolver,
      {},
      defaultArgs,
      {},
      {} as any
    );

    expect(mockValidationFunction).toHaveBeenCalledTimes(1);
    expect(mockResolver).toHaveBeenCalledTimes(1);
    expect(mockResolver).toHaveBeenCalledWith(
      {},
      {
        input: {
          jsonSchemaName: "some_schema_name",
          newFormData: {
            column: "value",
          },
          validationErrors: [{ error: "mock error" }],
        },
      },
      {},
      {} as any
    );
  });
});
