import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectRevisionTableRow from "components/ProjectRevision/ProjectRevisionTableRow";
import { graphql } from "react-relay";
import { getProjectRevisionViewPageRoute } from "routes/pageRoutes";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledProjectRevisionTableRowQuery, {
  ProjectRevisionTableRowQuery,
} from "__generated__/ProjectRevisionTableRowQuery.graphql";
import { ProjectRevisionTableRow_projectRevision } from "__generated__/ProjectRevisionTableRow_projectRevision.graphql";

const testQuery = graphql`
  query ProjectRevisionTableRowQuery($project_revision: ID!)
  @relay_test_operation {
    query {
      # Spread the fragment you want to test here
      projectRevision(id: $project_revision) {
        ...ProjectRevisionTableRow_projectRevision
      }
    }
  }
`;

const mockQueryPayload = {
  ProjectRevision() {
    const result: ProjectRevisionTableRow_projectRevision = {
      $fragmentType: "ProjectRevisionTableRow_projectRevision",
      id: "mock-id",
      revisionType: "revision-type-1",
      createdAt: "2021-01-01",
      revisionStatus: "revision-status-1",
      effectiveDate: "2021-02-01T23:59:59.999-07:00",
      updatedAt: "2021-02-01T23:59:59.999-07:00",
      typeRowNumber: 1,
      cifUserByUpdatedBy: { fullName: "test-user-1" },
      projectRevisionAmendmentTypesByProjectRevisionId: {
        edges: [
          { node: { amendmentType: "amendment-type-1" } },
          { node: { amendmentType: "amendment-type-2" } },
        ],
      },
    };
    return result;
  },
};

// We're using a wrapper component to avoid rendering errors with <td> elements
// not being in a table.
const TestWrapper: React.FC = (props: any) => {
  return (
    <table>
      <tbody>
        <ProjectRevisionTableRow {...props} />
      </tbody>
    </table>
  );
};

const componentTestingHelper =
  new ComponentTestingHelper<ProjectRevisionTableRowQuery>({
    component: TestWrapper,
    compiledQuery: compiledProjectRevisionTableRowQuery,
    testQuery: testQuery,
    defaultQueryResolver: mockQueryPayload,
    getPropsFromTestQuery: (data) => ({
      projectRevision: data.query.projectRevision,
    }),
  });

describe("The ProjectRevisionTableRow", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    componentTestingHelper.reinit();
  });

  it("Renders a row with the appropriate data in each cell", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(
      screen.getByRole("cell", {
        name: /revision\-type\-1 1/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("cell", {
        name: /jan[.]? 01, 2021/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("cell", { name: /feb[.]? 01, 2021/i })
    ).toHaveLength(2);
    expect(
      screen.getByRole("cell", {
        name: /test\-user\-1/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("cell", {
        name: /amendment\-type\-1, amendment\-type\-2/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("cell", {
        name: /revision\-status\-1/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /view/i,
      })
    ).toBeInTheDocument();
  });

  it("redirects the user to the project revision view page", async () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    await userEvent.click(
      screen.getByRole("button", {
        name: /view/i,
      })
    );
    expect(componentTestingHelper.router.push).toHaveBeenCalledWith(
      getProjectRevisionViewPageRoute("mock-id")
    );
  });
});
