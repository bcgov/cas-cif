import { screen } from "@testing-library/react";
import ProjectFormSummary from "components/Form/ProjectFormSummary";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledProjectFormSummaryQuery, {
  ProjectFormSummaryQuery,
} from "__generated__/ProjectFormSummaryQuery.graphql";
import { ProjectFormSummary_projectRevision } from "__generated__/ProjectFormSummary_projectRevision.graphql";

const testQuery = graphql`
  query ProjectFormSummaryQuery @relay_test_operation {
    query {
      projectRevision(id: "Test Project Revision ID") {
        ...ProjectFormSummary_projectRevision
      }
    }
  }
`;

const mockQueryPayload = {
  ProjectRevision() {
    const result: Partial<ProjectFormSummary_projectRevision> = {
      isFirstRevision: false,
      projectFormChange: {
        rank: 123456789,
        newFormData: {
          proposalReference: "Test Proposal Reference",
          operatorId: 2,
          fundingStreamRfpId: 1,
          projectStatusId: 1,
          summary: "Test Summary",
          projectName: "Test Project Name",
          totalFundingRequest: 100.0,
          score: 8.333,
          projectType: "test project type",
        },
        operation: "UPDATE",
        isPristine: false,
        asProject: {
          operatorByOperatorId: {
            legalName: "Test Legal Name",
            bcRegistryId: "Test BC Registry ID",
          },
          fundingStreamRfpByFundingStreamRfpId: {
            year: 2020,
            fundingStreamByFundingStreamId: {
              description: "Test Funding Stream Description",
            },
          },
          projectStatusByProjectStatusId: {
            name: "Test Project Status Name",
          },
        },
        latestCommittedProjectFormChanges: {
          edges: [
            {
              node: {
                rank: 987654321,
                newFormData: {
                  proposalReference: "Test Proposal Reference PREVIOUS",
                  operatorId: 1,
                  fundingStreamRfpId: 1,
                  projectStatusId: 1,
                  summary: "Test Summary",
                  projectName: "Test Project Name",
                  totalFundingRequest: 100.0,
                  score: 1,
                  projectType: "test project type PREVIOUS",
                },
                asProject: {
                  operatorByOperatorId: {
                    legalName: "Test Legal Name PREVIOUS",
                    bcRegistryId: "Test BC Registry ID",
                  },
                  fundingStreamRfpByFundingStreamRfpId: {
                    year: 2020,
                    fundingStreamByFundingStreamId: {
                      description: "Test Funding Stream Description",
                    },
                  },
                  projectStatusByProjectStatusId: {
                    name: "Test Project Status Name",
                  },
                },
              },
            },
          ],
        },
      },
    };
    return result;
  },
};

const defaultComponentProps = {
  setValidatingForm: jest.fn(),
  onSubmit: jest.fn(),
};

const componentTestingHelper =
  new ComponentTestingHelper<ProjectFormSummaryQuery>({
    component: ProjectFormSummary,
    testQuery: testQuery,
    compiledQuery: compiledProjectFormSummaryQuery,
    getPropsFromTestQuery: (data) => ({
      query: data.query,
      projectRevision: data.query.projectRevision,
    }),
    defaultQueryResolver: mockQueryPayload,
    defaultQueryVariables: {},
    defaultComponentProps: defaultComponentProps,
  });

describe("The Project Form Summary", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    componentTestingHelper.reinit();
  });

  it("Only displays the data fields that have changed", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText("Proposal Reference")).toBeInTheDocument();
    expect(
      screen.getByText("Legal Operator Name and BC Registry ID")
    ).toBeInTheDocument();
    expect(screen.getByText("Rank")).toBeInTheDocument();

    expect(screen.queryByText("RFP Year ID")).not.toBeInTheDocument();
    expect(screen.queryByText("Project Name")).not.toBeInTheDocument();
    expect(screen.queryByText("Project Description")).not.toBeInTheDocument();
    expect(screen.queryByText("Total Funding Request")).not.toBeInTheDocument();
    expect(screen.queryByText("Project Status")).not.toBeInTheDocument();
    expect(screen.queryByText("Project Type (optional)")).toBeInTheDocument();
    expect(screen.queryByText("Score (optional)")).toBeInTheDocument();
  });

  it("Displays diffs of the the data fields that have changed", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText("Test Proposal Reference")).toBeInTheDocument();
    expect(
      screen.getByText("Test Proposal Reference PREVIOUS")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Test Legal Name (Test BC Registry ID)")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Test Legal Name PREVIOUS (Test BC Registry ID)")
    ).toBeInTheDocument();
    expect(screen.getByText("test project type PREVIOUS")).toBeInTheDocument();
    expect(screen.getByText("123,456,789")).toBeInTheDocument();
    expect(screen.getByText("987,654,321")).toBeInTheDocument();
  });

  it("Displays all data when isFirstRevision is true (Project Creation)", () => {
    componentTestingHelper.loadQuery({
      ProjectRevision() {
        const result: Partial<ProjectFormSummary_projectRevision> = {
          isFirstRevision: true,
          projectFormChange: {
            rank: 10,
            newFormData: {
              proposalReference: "Test Proposal Reference",
              operatorId: 2,
              fundingStreamRfpId: 1,
              projectStatusId: 1,
              summary: "Test Summary",
              projectName: "Test Project Name",
              totalFundingRequest: 100.0,
              score: 8.333,
              projectType: "test project type",
            },
            operation: "UPDATE",
            isPristine: false,
            asProject: {
              operatorByOperatorId: {
                legalName: "Test Legal Name",
                bcRegistryId: "Test BC Registry ID",
              },
              fundingStreamRfpByFundingStreamRfpId: {
                year: 2020,
                fundingStreamByFundingStreamId: {
                  description: "Test Funding Stream Description",
                },
              },
              projectStatusByProjectStatusId: {
                name: "Test Project Status Name",
              },
            },
            formChangeByPreviousFormChangeId: {
              rank: 5,
              newFormData: {
                proposalReference: "Test Proposal Reference PREVIOUS",
                operatorId: 1,
                fundingStreamRfpId: 1,
                projectStatusId: 1,
                summary: "Test Summary",
                projectName: "Test Project Name",
                totalFundingRequest: 100.0,
                score: 8.333,
                projectType: "test project type",
              },
              asProject: {
                operatorByOperatorId: {
                  legalName: "Test Legal Name PREVIOUS",
                  bcRegistryId: "Test BC Registry ID",
                },
                fundingStreamRfpByFundingStreamRfpId: {
                  year: 2020,
                  fundingStreamByFundingStreamId: {
                    description: "Test Funding Stream Description",
                  },
                },
                projectStatusByProjectStatusId: {
                  name: "Test Project Status Name",
                },
              },
            },
          },
        };
        return result;
      },
    });
    componentTestingHelper.renderComponent();

    expect(screen.getByText("Proposal Reference")).toBeInTheDocument();
    expect(
      screen.getByText("Legal Operator Name and BC Registry ID")
    ).toBeInTheDocument();
    expect(screen.queryByText("RFP Year ID")).toBeInTheDocument();
    expect(screen.queryByText("Project Name")).toBeInTheDocument();
    expect(screen.queryByText("Project Description")).toBeInTheDocument();
    expect(screen.queryByText("Total Funding Request")).toBeInTheDocument();
    expect(screen.queryByText("Project Status")).toBeInTheDocument();
    expect(screen.queryByText("Project Type (optional)")).toBeInTheDocument();
    expect(screen.queryByText("Score (optional)")).toBeInTheDocument();
    expect(screen.queryByText("Rank")).toBeInTheDocument();
  });
});
