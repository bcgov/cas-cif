import { fireEvent, render, screen } from "@testing-library/react";
import { mocked } from "jest-mock";
import { useUpdateProjectRevision } from "mutations/ProjectRevision/updateProjectRevision";
import SelectWithNotifyWidget from "lib/theme/widgets/SelectWithNofifyWidget";

jest.mock("mutations/ProjectRevision/updateProjectRevision");

let isUpdatingProjectRevision = false;
const updateProjectRevisionMutation = jest.fn();
mocked(useUpdateProjectRevision).mockImplementation(() => [
  updateProjectRevisionMutation,
  isUpdatingProjectRevision,
]);

describe("The SelectWithNotifyWidget", () => {
  it("renders the select widget along with an action button", () => {
    const props: any = {
      id: "test-id",
      formContext: {
        revisionId: "test-revision-id",
        revisionStatus: "Draft",
      },
      value: "Option 1",
      schema: {
        anyOf: [
          { value: 1, enum: [1], type: "string", title: "Option 1" },
          { value: 2, enum: [2], type: "string", title: "Option 2" },
        ],
      },
    };
    render(<SelectWithNotifyWidget {...props} />);

    expect(
      screen.getByRole("button", {
        name: /Update/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /Notify/i,
      })
    ).toBeInTheDocument();
  });

  it("calls updateProjectRevision with the selected value from dropdown", async () => {
    const props: any = {
      id: "test-id",
      formContext: {
        revisionId: "test-revision-id",
        revisionStatus: "Draft",
      },
      value: "Option 1",
      schema: {
        anyOf: [
          { value: 1, enum: [1], type: "string", title: "Option 1" },
          { value: 2, enum: [2], type: "string", title: "Option 2" },
        ],
      },
    };

    render(<SelectWithNotifyWidget {...props} />);
    fireEvent.click(
      screen.getByRole("button", {
        name: /Update/i,
      })
    );
    expect(updateProjectRevisionMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          input: expect.objectContaining({
            id: "test-revision-id",
            projectRevisionPatch: expect.objectContaining({
              pendingActionsFrom: "Option 1",
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
      options: {
        text: "just for testing",
      },
    };
    render(<SelectWithNotifyWidget {...props} />);

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByText(/action button label/i)).not.toBeInTheDocument();
  });
});
