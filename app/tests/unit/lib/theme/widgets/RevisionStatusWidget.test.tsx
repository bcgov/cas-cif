import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import compiledRevisionStatusWidgetQuery, {
  RevisionStatusWidgetQuery,
} from "__generated__/RevisionStatusWidgetQuery.graphql";
import RevisionStatusWidget from "components/ProjectRevision/RevisionStatusWidget";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import { MockPayloadGenerator } from "relay-test-utils";

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
        formChangesByProjectRevisionId: {
          edges: [],
        },
      },
    };
  },
};

const widgetOptions = [
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
];

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
        anyOf: widgetOptions,
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

    act(() => {
      fireEvent.change(dropdown, { target: { value: "In Discussion" } });
    });
    expect(handleChangeStatus).toHaveBeenCalledWith("In Discussion");

    expect(
      screen.getByText(
        'To confirm your change, please click the "Update" button.'
      )
    ).toBeInTheDocument();

    componentTestingHelper.rerenderComponent(undefined, {
      value: "In Discussion",
      schema: {
        anyOf: widgetOptions,
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
            revisionStatus: "In Discussion",
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
  it("calls commitProjectRevision and redirects to view page when the select value is `Applied`", async () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    const dropdown: HTMLInputElement = screen.getByRole("combobox");

    act(() => {
      fireEvent.change(dropdown, { target: { value: "Applied" } });
    });
    componentTestingHelper.rerenderComponent(undefined, {
      value: "Applied",
      schema: {
        anyOf: widgetOptions,
      },
    });
    expect(dropdown.value).toEqual("Applied");
    expect(
      screen.getByText(
        /once approved, this revision will be immutable\. click the "update" button to confirm\./i
      )
    ).toBeInTheDocument();

    await act(() => {
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
    const operation =
      componentTestingHelper.environment.mock.getMostRecentOperation();
    act(() => {
      componentTestingHelper.environment.mock.resolve(
        operation,
        MockPayloadGenerator.generate(operation)
      );
    });
    expect(componentTestingHelper.router.replace).toHaveBeenCalledWith({
      pathname: "/cif/project-revision/[projectRevision]/view",
      query: {
        projectRevision: "test-revision-id",
      },
    });
  });
  it("can not change the status to Applied/Approved if there are validation errors", () => {
    componentTestingHelper.loadQuery({
      Query() {
        return {
          projectRevision: {
            id: "test-revision-id",
            rowId: "test-row-id",
            changeStatus: "pending",
            formChangesByProjectRevisionId: {
              edges: {
                node: {
                  validationErrors: ["validation error 1"],
                },
              },
            },
          },
        };
      },
    });
    componentTestingHelper.renderComponent();

    const dropdown: HTMLInputElement = screen.getByRole("combobox");

    act(() => {
      fireEvent.change(dropdown, { target: { value: "Applied" } });
    });
    componentTestingHelper.rerenderComponent(undefined, {
      value: "Applied",
      schema: {
        anyOf: widgetOptions,
      },
    });
    expect(dropdown.value).toEqual("Applied");
    expect(
      screen.getByText(
        /you can not commit this revision\/amendment\. please see "attention required"\./i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /update/i,
      })
    ).toBeDisabled();
  });
});
