import { renderHook } from "@testing-library/react-hooks";
import useArchiveMutation from "mutations/useArchiveMutation";

describe("The useArchiveMutation hook", () => {
  it("should call the relay hook with the passed id and the current date, with a properly named patch field", () => {
    const mockMutationFunction = jest.fn();

    jest
      .spyOn(require("react-relay"), "useMutation")
      .mockImplementation(() => [mockMutationFunction, jest.fn()]);

    const {
      result: {
        current: [mutationUnderTest],
      },
    } = renderHook(() =>
      useArchiveMutation(
        "testTableName",
        "some_irrelevant_graphql_for_this_test" as any
      )
    );

    mutationUnderTest("test_project_revision_id", {});

    expect(mockMutationFunction).toHaveBeenCalledWith({
      variables: {
        input: {
          id: "test_project_revision_id",
          testTableNamePatch: { archivedAt: expect.anything() },
        },
      },
    });
  });

  it("should pass the inFlight value from the internal relay hook", () => {
    const mockInFlight = jest.fn();

    jest
      .spyOn(require("react-relay"), "useMutation")
      .mockImplementation(() => [jest.fn(), mockInFlight]);

    const {
      result: {
        current: [, inFlightUnderTest],
      },
    } = renderHook(() =>
      useArchiveMutation(
        "testTableName",
        "some_irrelevant_graphql_for_this_test" as any
      )
    );

    expect(inFlightUnderTest).toEqual(mockInFlight);
  });
});
