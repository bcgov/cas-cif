import { fireEvent, screen } from "@testing-library/react";
import compiledRevisionStatusWidgetQuery, {
  RevisionStatusWidgetQuery,
} from "__generated__/RevisionStatusWidgetQuery.graphql";
import RevisionStatusWidget from "components/ProjectRevision/RevisionStatusWidget";
import { mocked } from "jest-mock";
import { useUpdateProjectRevision } from "mutations/ProjectRevision/updateProjectRevision";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";

jest.mock("mutations/ProjectRevision/updateProjectRevision");

let isUpdatingProjectRevision = false;
const updateProjectRevisionMutation = jest.fn();
mocked(useUpdateProjectRevision).mockImplementation(() => [
  updateProjectRevisionMutation,
  isUpdatingProjectRevision,
]);

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
        changeStatus: "pending",
      },
    };
  },
};

const componentTestingHelper =
  new ComponentTestingHelper<RevisionStatusWidgetQuery>({
    component: RevisionStatusWidget,
    testQuery: testQuery,
    compiledQuery: compiledRevisionStatusWidgetQuery,
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

describe("The RevisionStatusWidget", () => {
  beforeEach(() => {
    componentTestingHelper.reinit();
  });

  it("renders the select widget along with an action button", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(
      screen.getByRole("button", {
        name: /update/i,
      })
    ).toBeInTheDocument();
  });

  it("calls updateProjectRevision with the select widget value when click button", async () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

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
});
