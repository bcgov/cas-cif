import { act, fireEvent, screen } from "@testing-library/react";
import SelectWithNotifyWidget from "lib/theme/widgets/SelectWithNotifyWidget";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledSelectWithNotifyWidgetQuery, {
  SelectWithNotifyWidgetQuery,
} from "__generated__/SelectWithNotifyWidgetQuery.graphql";
import userEvent from "@testing-library/user-event";

const testQuery = graphql`
  query SelectWithNotifyWidgetQuery($projectRevision: ID!)
  @relay_test_operation {
    query {
      # eslint-disable-next-line relay/unused-fields
      projectRevision(id: $projectRevision) {
        ...SelectWithNotifyWidget_projectRevision
      }
    }
  }
`;

const mockQueryPayload = {
  Query() {
    return {
      projectRevision: {
        id: "test-revision-id",
        pendingActionsFrom: "Draft",
        revisionStatus: "Draft",
      },
    };
  },
};

const widgetOptions = [
  { value: "Option 1", enum: ["Option 1"], type: "string", title: "Option 1" },
  { value: "Option 2", enum: ["Option 2"], type: "string", title: "Option 2" },
];

const handleChange = jest.fn();

const componentTestingHelper =
  new ComponentTestingHelper<SelectWithNotifyWidgetQuery>({
    component: SelectWithNotifyWidget,
    testQuery: testQuery,
    compiledQuery: compiledSelectWithNotifyWidgetQuery,
    getPropsFromTestQuery: (data) => ({
      id: "test-id",
      value: "Option 1",
      label: "Pending Actions From",
      schema: {
        anyOf: widgetOptions,
      },
      formContext: data.query,
      options: {
        text: "just for testing", //This is a required prop but not required for the test
      },
      onChange: handleChange,
    }),
    defaultQueryResolver: mockQueryPayload,
    defaultQueryVariables: { projectRevision: "Test Revision ID" },
  });

describe("The SelectWithNotifyWidget", () => {
  beforeEach(() => {
    componentTestingHelper.reinit();
  });

  it("renders the select widget along with an action button and default value and default notify message", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    const dropdown: HTMLSelectElement = screen.getByRole("combobox", {
      name: /pending actions from/i,
    });
    expect(dropdown.value).toEqual("Option 1");

    expect(
      screen.getByText(
        'To notify them by email, please click the "Notify" button.'
      )
    ).toBeInTheDocument();

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

  it("calls updatePendingActionsFrom with the selected value from dropdown", async () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    const dropdown: HTMLSelectElement = screen.getByRole("combobox", {
      name: /pending actions from/i,
    });

    act(() => {
      fireEvent.change(dropdown, { target: { value: "Option 2" } });
    });

    expect(handleChange).toHaveBeenCalledWith("Option 2");

    expect(
      screen.getByText(
        'To confirm your change, please click the "Update" button.'
      )
    ).toBeInTheDocument();

    componentTestingHelper.rerenderComponent(undefined, {
      value: "Option 2",
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
      "updatePendingActionsFromMutation",
      {
        input: {
          id: "test-revision-id",
          projectRevisionPatch: {
            pendingActionsFrom: "Option 2",
          },
        },
      }
    );
  });
  it("renders widget in readonly mode when revision status is Applied", () => {
    const customQueryPayload = {
      ...mockQueryPayload,
      Query() {
        return {
          projectRevision: {
            id: "test-revision-id-2",
            revisionStatus: "Applied",
          },
        };
      },
    };
    componentTestingHelper.loadQuery(customQueryPayload);
    componentTestingHelper.renderComponent();

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByText(/action button label/i)).not.toBeInTheDocument();
  });
});
