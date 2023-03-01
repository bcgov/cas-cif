import { screen } from "@testing-library/react";
import ProjectMilestoneDue from "components/Project/ProjectMilestoneDue";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compliledProjectMilestoneDueQuery, {
  ProjectMilestoneDueQuery,
} from "__generated__/ProjectMilestoneDueQuery.graphql";

const testQuery = graphql`
  query ProjectMilestoneDueQuery($project: ID!) @relay_test_operation {
    query {
      project(id: $project) {
        ...ProjectMilestoneDue_project
      }
    }
  }
`;

const componentTestingHelper =
  new ComponentTestingHelper<ProjectMilestoneDueQuery>({
    component: ProjectMilestoneDue,
    compiledQuery: compliledProjectMilestoneDueQuery,
    testQuery: testQuery,
    defaultQueryResolver: {},
    getPropsFromTestQuery: (data) => ({ project: data.query.project }),
  });

describe("The Project Milestone Due component", () => {
  beforeEach(() => {
    componentTestingHelper.reinit();
  });

  it("Displays 'none' if there are no requirements completed nor upcoming", () => {
    componentTestingHelper.loadQuery({
      Project() {
        return {
          nextMilestoneDueDate: null,
          latestCompletedReportingRequirements: {
            edges: [],
          },
        };
      },
    });
    componentTestingHelper.renderComponent();

    expect(screen.getByText("None")).toBeInTheDocument();
  });

  it("Displays 'Complete' if there are no upcoming reporting requirements, and completed reporting requirements", () => {
    componentTestingHelper.loadQuery({
      Project() {
        return {
          nextMilestoneDueDate: "2020-01-02",
          latestCompletedReportingRequirements: {
            edges: [
              {
                node: {
                  reportDueDate: "2020-01-02",
                },
              },
            ],
          },
        };
      },
    });
    componentTestingHelper.renderComponent();

    expect(screen.getByText("Complete")).toBeInTheDocument();
  });

  it("Displays 'Late' if the next upcoming requirement is overdue", () => {
    componentTestingHelper.loadQuery({
      Project() {
        return {
          nextMilestoneDueDate: "2020-01-01",
          latestCompletedReportingRequirements: {
            edges: [
              {
                node: {
                  reportDueDate: "2070-01-02",
                },
              },
            ],
          },
        };
      },
    });
    componentTestingHelper.renderComponent();

    expect(screen.getByText("Late")).toBeInTheDocument();
  });

  it("Displays 'On track' if the next upcoming requirement is not due yet", () => {
    componentTestingHelper.loadQuery({
      Project() {
        return {
          nextMilestoneDueDate: "2080-01-01",
          latestCompletedReportingRequirements: {
            edges: [],
          },
        };
      },
    });
    componentTestingHelper.renderComponent();

    expect(screen.getByText("On track")).toBeInTheDocument();
  });
});
