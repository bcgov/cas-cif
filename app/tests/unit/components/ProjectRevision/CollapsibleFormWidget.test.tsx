import { screen } from "@testing-library/react";
import ProjectFormSummary from "components/Form/ProjectFormSummary";
import CollapsibleFormWidget from "components/ProjectRevision/CollapsibleFormWidget";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import { graphql } from "react-relay";
import compiledCollapsibleFormWidgetQuery, {
  CollapsibleFormWidgetQuery,
} from "__generated__/CollapsibleFormWidgetQuery.graphql";

const testQuery = graphql`
  query CollapsibleFormWidgetQuery @relay_test_operation {
    query {
      projectRevision(id: "Test Project Revision ID") {
        ...CollapsibleFormWidget_projectRevision
      }
    }
  }
`;

const mockQueryPayload = {
  ProjectRevision() {
    return {
      isFirstRevision: false,
      projectFormChange: {
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
      },
      latestCommittedProjectFormChanges: {
        edges: [
          {
            node: {
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
    };
  },
};

const componentTestingHelper =
  new ComponentTestingHelper<CollapsibleFormWidgetQuery>({
    component: CollapsibleFormWidget,
    testQuery: testQuery,
    compiledQuery: compiledCollapsibleFormWidgetQuery,
    getPropsFromTestQuery: (data) => ({
      title: "Test Title",
      formItems: [
        {
          title: "Project Overview",
          formConfiguration: {
            formIndex: 0,
            slug: "projectOverview",
            editComponent: "ProjectForm",
            viewComponent: ProjectFormSummary,
          },
        },
      ],
      projectRevision: data.query.projectRevision,
    }),
    defaultQueryResolver: mockQueryPayload,
    defaultQueryVariables: {},
  });

describe("The CollapsibleFormWidget", () => {
  it("Displays diffs of the the data fields that have changed", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(
      screen.getByRole("checkbox", { name: /test title/i })
    ).toBeInTheDocument();
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
  });
  it("Displays diffs of the the data fields that have changed with proper classnames", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    // testing some classnames that are used to style the diff
    expect(screen.getByText("Test Proposal Reference")).toHaveClass("diffNew");
    expect(screen.getByText("Test Proposal Reference PREVIOUS")).toHaveClass(
      "diffOld"
    );
  });
});
