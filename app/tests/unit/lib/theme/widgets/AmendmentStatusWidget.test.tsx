import { fireEvent, render, screen } from "@testing-library/react";
import AmendmentStatusWidget from "lib/theme/widgets/AmendmentStatusWidget";
import { mocked } from "jest-mock";
import { useUpdateProjectRevision } from "mutations/ProjectRevision/updateProjectRevision";

jest.mock("mutations/ProjectRevision/updateProjectRevision");

let isUpdatingProjectRevision = false;
const updateProjectRevisionMutation = jest.fn();
mocked(useUpdateProjectRevision).mockImplementation(() => [
  updateProjectRevisionMutation,
  isUpdatingProjectRevision,
]);

describe("The AmendmentStatusWidget", () => {
  it("renders the select widget along with an action button", () => {
    const props: any = {
      id: "test-id",
      formContext: {
        revisionId: "test-revision-id",
        changeStatus: "committed",
      },
      uiSchema: {
        "ui:options": {
          actionButtonLabel: "Action Button Label",
        },
      },
      value: "Option 1",
      schema: {
        anyOf: [
          { value: 1, enum: [1], type: "string", title: "Option 1" },
          { value: 2, enum: [2], type: "string", title: "Option 2" },
        ],
      },
    };
    render(<AmendmentStatusWidget {...props} />);

    expect(
      screen.getByRole("button", {
        name: /action button label/i,
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
      uiSchema: {
        "ui:options": {
          actionButtonLabel: "Action Button Label",
        },
      },
      value: "Option 1",
      schema: {
        anyOf: [
          { value: 1, enum: [1], type: "string", title: "Option 1" },
          { value: 2, enum: [2], type: "string", title: "Option 2" },
        ],
      },
    };

    render(<AmendmentStatusWidget {...props} />);
    fireEvent.click(
      screen.getByRole("button", {
        name: /action button label/i,
      })
    );
    expect(updateProjectRevisionMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          input: expect.objectContaining({
            id: "test-revision-id",
            projectRevisionPatch: expect.objectContaining({
              amendmentStatus: "Option 1",
            }),
          }),
        }),
      })
    );
  });
  it("renders widget in disabled mode when revision status is committed", () => {
    const props: any = {
      id: "test-id",
      formContext: {
        revisionId: "test-revision-id",
        changeStatus: "committed",
      },
      uiSchema: {
        "ui:options": {
          actionButtonLabel: "Action Button Label",
        },
      },
      value: "Option 1",
      schema: {
        anyOf: [
          { value: 1, enum: [1], type: "string", title: "Option 1" },
          { value: 2, enum: [2], type: "string", title: "Option 2" },
        ],
      },
    };
    render(<AmendmentStatusWidget {...props} />);

    expect(screen.getByRole("combobox")).toBeDisabled();

    expect(
      screen.getByRole("button", {
        name: /action button label/i,
      })
    ).toBeDisabled();
  });
});
