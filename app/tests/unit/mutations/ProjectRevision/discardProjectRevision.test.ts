import { renderHook } from "@testing-library/react-hooks";
import useDiscardProjectMutation from "mutations/ProjectRevision/discardProjectRevision";

describe("the discardProjectRevision mutation hook", () => {
  it("should call the relay hook with the passed id and the current date", () => {
    const mockMutationFunction = jest.fn();

    jest
      .spyOn(require("react-relay"), "useMutation")
      .mockImplementation(() => [mockMutationFunction, jest.fn()]);

    const {
      result: {
        current: [mutationUnderTest],
      },
    } = renderHook(() => useDiscardProjectMutation());

    mutationUnderTest("test_project_revision_id", {});

    expect(mockMutationFunction).toHaveBeenCalledWith({
      variables: {
        input: {
          id: "test_project_revision_id",
          projectRevisionPatch: { deletedAt: expect.anything() },
        },
      },
    });
  });
});
