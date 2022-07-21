import { screen } from "@testing-library/react";
import ProjectEmissionIntensityReportFormSummary from "components/Form/ProjectEmissionIntensityReportFormSummary";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledFormIndexPageQuery, {
  FormIndexPageQuery,
} from "__generated__/FormIndexPageQuery.graphql";

const testQuery = graphql`
  query ProjectEmissionIntensityReportFormSummaryQuery @relay_test_operation {
    query {
      # Spread the fragment you want to test here
      projectRevision(id: "Test Project Revision ID") {
        ...ProjectEmissionIntensityReportFormSummary_projectRevision
      }
    }
  }
`;

const defaultMockResolver = {
  ProjectRevision() {
    return {
      summaryEmissionIntensityReportingRequirementFormChange: {
        edges: [
          {
            node: {
              id: "1",
              isPristine: false,
              newFormData: {
                comments: "bulbasaur",
                projectId: 1,
                reportingRequirementIndex: 1,
                reportType: "TEIMP",
                reportDueDate: "2020-01-10T23:59:59.999-07:00",
              },
              operation: "UPDATE",
              formChangeByPreviousFormChangeId: {
                newFormData: {
                  comments: "squirtle",
                  projectId: 1,
                  reportingRequirementIndex: 1,
                  reportDueDate: "2020-01-01T13:59:59.999-07:00",
                },
              },
              formDataRecordId: 1,
            },
          },
        ],
      },
      summaryEmissionIntensityReportFormChange: {
        edges: [
          {
            node: {
              id: "1",
              isPristine: false,
              newFormData: {
                reportingRequirementId: 1,
              },
              operation: "UPDATE",
              formChangeByPreviousFormChangeId: {
                newFormData: {
                  reportingRequirementId: 1,
                },
              },
            },
          },
        ],
      },
    };
  },
};

const defaultComponentProps = {
  setValidatingForm: jest.fn(),
  onSubmit: jest.fn(),
};

const componentTestingHelper = new ComponentTestingHelper<FormIndexPageQuery>({
  component: ProjectEmissionIntensityReportFormSummary,
  testQuery: testQuery,
  compiledQuery: compiledFormIndexPageQuery,
  getPropsFromTestQuery: (data) => ({
    query: data.query,
    projectRevision: data.query.projectRevision,
  }),
  defaultQueryResolver: defaultMockResolver,
  defaultQueryVariables: { projectRevision: "mock-id" },
  defaultComponentProps: defaultComponentProps,
});

describe("the emission intensity report form component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    componentTestingHelper.reinit();
  });

  it("only displays the data fields that have changed", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText("Comments")).toBeInTheDocument();
  });

  it("displays a 'not updated' when there were no updates to the form", () => {
    const mockResolver = {
      ...defaultMockResolver,
      ProjectRevision() {
        return {
          ...defaultMockResolver.ProjectRevision(),

          summaryEmissionIntensityReportingRequirementFormChange: {
            edges: [],
          },
          summaryEmissionIntensityReportFormChange: {
            edges: [],
          },
        };
      },
    };
    componentTestingHelper.loadQuery(mockResolver);
    componentTestingHelper.renderComponent();

    expect(
      screen.getByText("Emission Intensity Report not updated")
    ).toBeInTheDocument();
  });

  it("only displays the fields that were updated on the summary", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText("squirtle")).toBeInTheDocument();
  });
});
