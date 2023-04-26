import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import compiledChangeReasonWidgetQuery, {
  ChangeReasonWidgetQuery,
} from "__generated__/ChangeReasonWidgetQuery.graphql";
import ChangeReasonWidget from "components/ProjectRevision/ChangeReasonWidget";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";

const testQuery = graphql`
  query ChangeReasonWidgetQuery($projectRevision: ID!) @relay_test_operation {
    query {
      # eslint-disable-next-line relay/unused-fields
      projectRevision(id: $projectRevision) {
        ...ChangeReasonWidget_projectRevision
      }
    }
  }
`;

const mockQueryPayload = {
  Query() {
    return {
      projectRevision: {
        id: "test-revision-id",
        changeStatus: "pending",
      },
    };
  },
};

const handleChangeReason = jest.fn();

const componentTestingHelper =
  new ComponentTestingHelper<ChangeReasonWidgetQuery>({
    component: ChangeReasonWidget,
    testQuery: testQuery,
    compiledQuery: compiledChangeReasonWidgetQuery,
    getPropsFromTestQuery: (data) => ({
      formContext: data.query,
    }),
    defaultQueryResolver: mockQueryPayload,
    defaultQueryVariables: { projectRevision: "Test Revision ID" },
    defaultComponentProps: {
      id: "test-id",
      value: "A reason for change",
      options: {
        text: "just for testing", //This is a required prop but not required for the test
      },
      onChange: handleChangeReason,
    },
  });

describe("The ChangeReasonWidget", () => {
  beforeEach(() => {
    componentTestingHelper.reinit();
  });

  it("renders the change reason textbox widget with default value along with an action button", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    expect(screen.getByText("A reason for change")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /update/i,
      })
    ).toBeInTheDocument();
  });

  it("calls updateProjectRevision with the change reason textarea widget value when click button", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    const commentTextBox: HTMLTextAreaElement = screen.getByRole("textbox");
    const newChangeReason = "Another reason for change";

    act(() => {
      fireEvent.change(commentTextBox, {
        target: { value: "Another reason for change" },
      });
    });
    expect(handleChangeReason).toHaveBeenCalledWith(newChangeReason);

    componentTestingHelper.rerenderComponent(undefined, {
      value: newChangeReason,
    });
    expect(screen.getByText(newChangeReason)).toBeInTheDocument();

    act(() => {
      userEvent.click(
        screen.getByRole("button", {
          name: /update/i,
        })
      );
    });

    componentTestingHelper.expectMutationToBeCalled(
      "updateProjectRevisionMutation",
      {
        input: {
          id: "test-revision-id",
          projectRevisionPatch: {
            changeReason: newChangeReason,
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

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByText(/update/i)).not.toBeInTheDocument();
  });
});
