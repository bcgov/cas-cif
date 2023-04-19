import { fireEvent, screen } from "@testing-library/react";
import { mocked } from "jest-mock";
import { useUpdatePendingActionsFrom } from "mutations/ProjectRevision/updatePendingActionsFrom";
import SelectWithNotifyWidget from "lib/theme/widgets/SelectWithNotifyWidget";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledSelectWithNotifyWidgetQuery, {
  SelectWithNotifyWidgetQuery,
} from "__generated__/SelectWithNotifyWidgetQuery.graphql";

jest.mock("mutations/ProjectRevision/updatePendingActionsFrom");

let isUpdatingPendingActionsFrom = false;
const updatePendingActionsFromMutation = jest.fn();
mocked(useUpdatePendingActionsFrom).mockImplementation(() => [
  updatePendingActionsFromMutation,
  isUpdatingPendingActionsFrom,
]);

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

const componentTestingHelper =
  new ComponentTestingHelper<SelectWithNotifyWidgetQuery>({
    component: SelectWithNotifyWidget,
    testQuery: testQuery,
    compiledQuery: compiledSelectWithNotifyWidgetQuery,
    getPropsFromTestQuery: (data) => ({
      id: "test-id",
      value: "Option 1",
      schema: {
        anyOf: [
          { value: 1, enum: [1], type: "number", title: "Option 1" },
          { value: 2, enum: [2], type: "number", title: "Option 2" },
        ],
      },
      formContext: data.query,
      options: {
        text: "just for testing", //This is a required prop but not required for the test
      },
    }),
    defaultQueryResolver: mockQueryPayload,
    defaultQueryVariables: { projectRevision: "Test Revision ID" },
  });

describe("The SelectWithNotifyWidget", () => {
  beforeEach(() => {
    componentTestingHelper.reinit();
  });

  it("renders the select widget along with an action button", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

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

    fireEvent.click(
      screen.getByRole("button", {
        name: /Update/i,
      })
    );
    expect(updatePendingActionsFromMutation).toHaveBeenCalledWith(
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
