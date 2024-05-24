import { screen } from "@testing-library/react";
import ProjectManagerFormSummary from "components/Form/ProjectManagerFormSummary";
import projectManagerProdSchema from "../../../../../schema/data/prod/json_schema/project_manager.json";

import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledProjectManagerFormSummaryQuery, {
  ProjectManagerFormSummaryQuery,
} from "__generated__/ProjectManagerFormSummaryQuery.graphql";

const testQuery = graphql`
  query ProjectManagerFormSummaryQuery($projectRevision: ID!)
  @relay_test_operation {
    query {
      projectRevision(id: $projectRevision) {
        ...ProjectManagerFormSummary_projectRevision
      }
    }
  }
`;

const mockQueryPayload = {
  Query() {
    return {
      projectRevision: {
        id: "Test Revision ID",
        isFirstRevision: false,
        projectManagerFormChangesByLabel: {
          edges: [
            {
              node: {
                formChange: {
                  newFormData: {
                    projectId: 1,
                    cifUserId: 1,
                    projectManagerLabelId: 1,
                  },
                  isPristine: false,
                  operation: "UPDATE",
                  asProjectManager: {
                    cifUserByCifUserId: {
                      fullName: "Test Full Name Update",
                    },
                  },
                },
                projectManagerLabel: {
                  label: "Test First Label",
                },
              },
            },
            {
              node: {
                formChange: {
                  newFormData: {
                    projectId: 1,
                    cifUserId: 2,
                    projectManagerLabelId: 2,
                  },
                  isPristine: false,
                  operation: "ARCHIVE",
                  asProjectManager: {
                    cifUserByCifUserId: {
                      fullName: "Test Full Name Archive",
                    },
                  },
                },
                projectManagerLabel: {
                  label: "Test Second Label",
                },
              },
            },
            {
              node: {
                formChange: {
                  newFormData: {
                    projectId: 1,
                    cifUserId: 3,
                    projectManagerLabelId: 3,
                  },
                  isPristine: false,
                  operation: "CREATE",
                  asProjectManager: {
                    cifUserByCifUserId: {
                      fullName: "Test Full Name Create",
                    },
                  },
                },
                projectManagerLabel: {
                  label: "Test Third Label",
                },
              },
            },
            {
              node: {
                formChange: {
                  newFormData: {
                    projectId: 1,
                    cifUserId: 4,
                    projectManagerLabelId: 4,
                  },
                  isPristine: true,
                  operation: "UPDATE",
                  asProjectManager: {
                    cifUserByCifUserId: {
                      fullName: "Test Full Name No Change",
                    },
                  },
                },
                projectManagerLabel: {
                  label: "Test Fourth Label",
                },
              },
            },
          ],
        },
        latestCommittedProjectManagerFormChanges: {
          edges: [
            {
              node: {
                newFormData: {
                  projectId: 1,
                  cifUserId: 1,
                  projectManagerLabelId: 1,
                },
                asProjectManager: {
                  cifUserByCifUserId: {
                    fullName: "Test Full Name Update PREVIOUS",
                  },
                },
              },
            },
            {
              node: {
                newFormData: {
                  projectId: 1,
                  cifUserId: 1,
                  projectManagerLabelId: 1,
                },
                asProjectManager: {
                  cifUserByCifUserId: {
                    fullName: "Test Full Name Archive PREVIOUS",
                  },
                },
              },
            },
            {
              node: {
                newFormData: {
                  projectId: 1,
                  cifUserId: 4,
                  projectManagerLabelId: 4,
                },
                asProjectManager: {
                  cifUserByCifUserId: {
                    fullName: "Test Full Name No Change",
                  },
                },
              },
            },
          ],
        },
      },
    };
  },
  Form() {
    return {
      jsonSchema: projectManagerProdSchema,
    };
  },
};

const componentTestingHelper =
  new ComponentTestingHelper<ProjectManagerFormSummaryQuery>({
    component: ProjectManagerFormSummary,
    testQuery: testQuery,
    compiledQuery: compiledProjectManagerFormSummaryQuery,
    getPropsFromTestQuery: (data) => ({
      query: data.query,
      projectRevision: data.query.projectRevision,
      revision: data.query.projectRevision,
    }),
    defaultQueryResolver: mockQueryPayload,
    defaultQueryVariables: { projectRevision: "Test Revision ID" },
  });

describe("The ProjectManagerForm", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    componentTestingHelper.reinit();
  });

  it("Only displays the data fields that have changed", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText("Test First Label (optional)")).toBeInTheDocument();
    expect(
      screen.getByText("Test Second Label (optional)")
    ).toBeInTheDocument();
    expect(screen.getByText("Test Third Label (optional)")).toBeInTheDocument();
    expect(
      screen.queryByText("Test Fourth Label (optional)")
    ).not.toBeInTheDocument();
  });

  it("Only displays diffs of the the data fields that have changed", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText("Test Full Name Update")).toBeInTheDocument();
    expect(
      screen.getByText("Test Full Name Update PREVIOUS")
    ).toBeInTheDocument();
  });
});
