import { fireEvent, render, screen } from "@testing-library/react";
import { mocked } from "jest-mock";
import { useUpdateProjectRevision } from "mutations/ProjectRevision/updateProjectRevision";
import { RevisionStatusWidget } from "pages/cif/project-revision/[projectRevision]/view";

jest.mock("mutations/ProjectRevision/updateProjectRevision");

let isUpdatingProjectRevision = false;
const updateProjectRevisionMutation = jest.fn();
mocked(useUpdateProjectRevision).mockImplementation(() => [
  updateProjectRevisionMutation,
  isUpdatingProjectRevision,
]);

describe("The RevisionStatusWidget", () => {
  it("renders the select widget along with an action button", () => {
    const props: any = {
      id: "test-id",
      formContext: {
        revisionId: "test-revision-id",
        changeStatus: "pending",
      },
      value: "Option 1",
      schema: {
        anyOf: [
          { value: 1, enum: [1], type: "string", title: "Option 1" },
          { value: 2, enum: [2], type: "string", title: "Option 2" },
        ],
      },
    };
    render(<RevisionStatusWidget {...props} />);

    expect(
      screen.getByRole("button", {
        name: /update/i,
      })
    ).toBeInTheDocument();
  });

  it("calls updateProjectRevision with the select widget value when click button", async () => {
    const props: any = {
      id: "test-id",
      formContext: {
        revisionId: "test-revision-id",
        changeStatus: "pending",
      },
      value: "Option 1",
      schema: {
        anyOf: [
          { value: 1, enum: [1], type: "string", title: "Option 1" },
          { value: 2, enum: [2], type: "string", title: "Option 2" },
        ],
      },
    };

    render(<RevisionStatusWidget {...props} />);
    fireEvent.click(
      screen.getByRole("button", {
        name: /update/i,
      })
    );
    expect(updateProjectRevisionMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          input: expect.objectContaining({
            id: "test-revision-id",
            projectRevisionPatch: expect.objectContaining({
              revisionStatus: "Option 1",
            }),
          }),
        }),
      })
    );
  });
  it("renders widget in readonly mode when revision status is not pending", () => {
    const props: any = {
      id: "test-id",
      formContext: {
        revisionId: "test-revision-id",
        changeStatus: "committed",
      },
      value: "Option 1",
      schema: {
        anyOf: [
          { value: 1, enum: [1], type: "string", title: "Option 1" },
          { value: 2, enum: [2], type: "string", title: "Option 2" },
        ],
      },
      options: {
        text: "just for testing",
      },
    };
    render(<RevisionStatusWidget {...props} />);

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByText(/update/i)).not.toBeInTheDocument();
  });
});
