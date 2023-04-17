import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import compiledRevisionStatusWidgetQuery, {
  RevisionStatusWidgetQuery,
} from "__generated__/RevisionStatusWidgetQuery.graphql";
import RevisionStatusWidget from "components/ProjectRevision/RevisionStatusWidget";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";

const testQuery = graphql`
  query RevisionStatusWidgetQuery($projectRevision: ID!) @relay_test_operation {
    query {
      # eslint-disable-next-line relay/unused-fields
      projectRevision(id: $projectRevision) {
        ...RevisionStatusWidget_projectRevision
      }
    }
  }
`;

const mockQueryPayload = {
  Query() {
    return {
      projectRevision: {
        id: "test-revision-id",
        rowId: "test-row-id",
        changeStatus: "pending",
      },
    };
  },
};

const handleChangeStatus = jest.fn();

const componentTestingHelper =
  new ComponentTestingHelper<RevisionStatusWidgetQuery>({
    component: RevisionStatusWidget,
    testQuery: testQuery,
    compiledQuery: compiledRevisionStatusWidgetQuery,
    getPropsFromTestQuery: (data) => ({
      formContext: data.query,
    }),
    defaultQueryResolver: mockQueryPayload,
    defaultComponentProps: {
      id: "test-id",
      label: "Revision Status",
      value: "Draft",
      default: undefined,
      enum: undefined,
      type: "string",
      schema: {
        anyOf: [
          { value: "Draft", enum: ["Draft"], type: "string", title: "Draft" },
          {
            value: "In Discussion",
            enum: ["In Discussion"],
            type: "string",
            title: "In Discussion",
          },
          {
            value: "Applied",
            enum: ["Applied"],
            type: "string",
            title: "Applied",
          },
        ],
      },
      options: {
        text: "just for testing", //This is a required prop but not required for the test
      },
      onChange: handleChangeStatus,
    },
  });

describe("The RevisionStatusWidget", () => {
  beforeEach(() => {
    componentTestingHelper.reinit();
  });

  it("renders the select widget along with an action button", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    const dropdown: HTMLInputElement = screen.getByRole("combobox", {
      name: /revision status/i,
    });
    expect(dropdown).toBeInTheDocument();
    expect(dropdown.value).toEqual("Draft");

    expect(
      screen.getByRole("button", {
        name: /update/i,
      })
    ).toBeInTheDocument();
  });

  it("calls updateProjectRevision with the select widget value when click button", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    const dropdown: HTMLInputElement = screen.getByRole("combobox", {
      name: /revision status/i,
    });
    const newStatus = "In Discussion";

    act(() => {
      fireEvent.change(dropdown, { target: { value: newStatus } });
    });
    expect(handleChangeStatus).toHaveBeenCalledWith(newStatus);

    expect(
      screen.getByText(
        'To confirm your change, please click the "Update" button.'
      )
    ).toBeInTheDocument();

    componentTestingHelper.rerenderComponent(undefined, {
      value: newStatus,
      schema: {
        anyOf: [
          { value: "Draft", enum: ["Draft"], type: "string", title: "Draft" },
          {
            value: "In Discussion",
            enum: ["In Discussion"],
            type: "string",
            title: "In Discussion",
          },
          {
            value: "Applied",
            enum: ["Applied"],
            type: "string",
            title: "Applied",
          },
        ],
      },
    });

    act(() => {
      const updateButton = screen.getByRole("button", {
        name: /update/i,
      });
      expect(updateButton).not.toBeDisabled();
      userEvent.click(updateButton);
    });
    componentTestingHelper.expectMutationToBeCalled(
      "updateProjectRevisionMutation",
      {
        input: {
          id: "test-revision-id",
          projectRevisionPatch: {
            revisionStatus: newStatus,
          },
        },
      }
    );
  });
  it("renders widget in readonly mode when revision status is not pending", () => {
    const customQueryPayload = {
      ...mockQueryPayload,
      Query() {
        return {
          projectRevision: {
            id: "test-revision-id-2",
            changeStatus: "not-pending",
          },
        };
      },
    };
    componentTestingHelper.loadQuery(customQueryPayload);
    componentTestingHelper.renderComponent();

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByText(/update/i)).not.toBeInTheDocument();
  });
  it("calls commitProjectRevision when the select value is `Applied`", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    const newStatus = "Applied";

    const dropdown: HTMLInputElement = screen.getByRole("combobox");

    act(() => {
      fireEvent.change(dropdown, { target: { value: newStatus } });
    });
    componentTestingHelper.rerenderComponent(undefined, {
      value: newStatus,
      schema: {
        anyOf: [
          { value: "Draft", enum: ["Draft"], type: "string", title: "Draft" },
          {
            value: "In Discussion",
            enum: ["In Discussion"],
            type: "string",
            title: "In Discussion",
          },
          {
            value: "Applied",
            enum: ["Applied"],
            type: "string",
            title: "Applied",
          },
        ],
      },
    });
    expect(dropdown.value).toEqual(newStatus);
    expect(
      screen.getByText(
        /once approved, this revision will be immutable\. click the "update" button to confirm\./i
      )
    ).toBeInTheDocument();

    act(() => {
      userEvent.click(
        screen.getByRole("button", {
          name: /update/i,
        })
      );
    });
    componentTestingHelper.expectMutationToBeCalled(
      "useCommitProjectRevisionMutation",
      {
        input: {
          revisionToCommitId: "test-row-id",
        },
      }
    );
  });
});
