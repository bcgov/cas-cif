import { screen } from "@testing-library/react";
import ProjectQuarterlyReportForm from "components/Form/ProjectQuarterlyReportForm";
import { DateTime, Settings } from "luxon";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledFormIndexPageQuery, {
  FormIndexPageQuery,
} from "__generated__/FormIndexPageQuery.graphql";

const testQuery = graphql`
  query reportStatusHelpersQuery @relay_test_operation {
    query {
      # Spread the fragment you want to test here
      projectRevision(id: "I can be anything") {
        ...ProjectQuarterlyReportForm_projectRevision
      }
    }
  }
`;

const defaultMockResolver = {
  ProjectRevision(context, generateID) {
    const firstFormId = `mock-project-quarterly-report-form-${generateID()}`;
    return {
      id: `mock-proj-rev-${generateID()}`,
      rowId: 1234,
      upcomingQuarterlyReportFormChange: {
        id: firstFormId,
        asReportingRequirement: {
          reportDueDate: "2022-01-01T00:00:00-07",
          reportingRequirementIndex: 1,
        },
      },
      projectQuarterlyReportFormChanges: {
        edges: [
          {
            node: {
              id: firstFormId,
              newFormData: {
                reportDueDate: "2022-01-01T00:00:00-07",
                projectId: 51,
                reportType: "Quarterly",
              },
              operation: "CREATE",
              changeStatus: "pending",
              formChangeByPreviousFormChangeId: null,
            },
          },
          {
            node: {
              id: `mock-project-quarterly-report-form-${generateID()}`,
              newFormData: {
                reportDueDate: "2022-10-28T00:00:00-07",
                comments: "some comments",
                projectId: 51,
                reportType: "Quarterly",
                submittedDate: "2022-05-02T00:00:00-07",
              },
              operation: "CREATE",
              changeStatus: "pending",
              formChangeByPreviousFormChangeId: null,
            },
          },
        ],
        __id: "client:mock:__connection_projectQuarterlyReportFormChanges_connection",
      },
    };
  },
};

const defaultComponentProps = {
  setValidatingForm: jest.fn(),
  onSubmit: jest.fn(),
};

const componentTestingHelper = new ComponentTestingHelper<FormIndexPageQuery>({
  component: ProjectQuarterlyReportForm,
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

describe("The report status helpers display the correct status badge, which", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    componentTestingHelper.reinit();
  });

  it("shows `Late` when any reports are late", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    expect(screen.getByText("Late")).toBeInTheDocument();
  });

  it("shows `On track` when all reports are on track", () => {
    const jan20th2020 = DateTime.local(2020, 1, 20, {
      zone: "America/Vancouver",
    }).toMillis();
    Settings.now = () => jan20th2020;
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText("On track")).toBeInTheDocument();
  });

  it("shows `None` when there are no reports", () => {
    componentTestingHelper.loadQuery({
      ProjectRevision(context, generateID) {
        return {
          id: `mock-proj-rev-${generateID()}`,
          rowId: 1234,
          upcomingQuarterlyReportFormChange: null,
          projectQuarterlyReportFormChanges: {
            edges: [],
            __id: "client:mock:__connection_projectQuarterlyReportFormChanges_connection",
          },
        };
      },
    });
    componentTestingHelper.renderComponent();

    expect(screen.getByText("None")).toBeInTheDocument();
  });

  it("shows `Complete` when all reports are complete", () => {
    const jan20th2020 = DateTime.local(2020, 1, 20, {
      zone: "America/Vancouver",
    }).toMillis();
    Settings.now = () => jan20th2020;
    componentTestingHelper.loadQuery({
      ProjectRevision(context, generateID) {
        const firstFormId = `mock-project-quarterly-report-form-${generateID()}`;
        return {
          id: `mock-proj-rev-${generateID()}`,
          rowId: 1234,
          upcomingQuarterlyReportFormChange: null,
          projectQuarterlyReportFormChanges: {
            edges: [
              {
                node: {
                  id: firstFormId,
                  newFormData: {
                    reportDueDate: "2022-01-01T00:00:00-07",
                    submittedDate: "2022-01-01T00:00:00-07",
                    projectId: 51,
                    reportType: "Quarterly",
                  },
                  operation: "CREATE",
                  changeStatus: "pending",
                  formChangeByPreviousFormChangeId: null,
                },
              },
              {
                node: {
                  id: `mock-project-quarterly-report-form-${generateID()}`,
                  newFormData: {
                    reportDueDate: "2022-10-28T00:00:00-07",
                    submittedDate: "2022-10-28T00:00:00-07",
                    comments: "some comments",
                    projectId: 51,
                    reportType: "Quarterly",
                  },
                  operation: "CREATE",
                  changeStatus: "pending",
                  formChangeByPreviousFormChangeId: null,
                },
              },
            ],
            __id: "client:mock:__connection_projectQuarterlyReportFormChanges_connection",
          },
        };
      },
    });
    componentTestingHelper.renderComponent();

    expect(screen.getByText("Complete")).toBeInTheDocument();
  });
});
