import { screen } from "@testing-library/react";
import ProjectContactFormSummary from "components/Form/ProjectContactFormSummary";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledProjectContactFormSummaryQuery, {
  ProjectContactFormSummaryQuery,
} from "__generated__/ProjectContactFormSummaryQuery.graphql";
import { ProjectContactFormSummary_projectRevision } from "__generated__/ProjectContactFormSummary_projectRevision.graphql";
import projectContactProdSchema from "../../../../../schema/data/prod/json_schema/project_contact.json";

const testQuery = graphql`
  query ProjectContactFormSummaryQuery @relay_test_operation {
    query {
      projectRevision(id: "Test Project Revision ID") {
        ...ProjectContactFormSummary_projectRevision
      }
    }
  }
`;

const mockQueryPayload = {
  ProjectRevision() {
    const result: ProjectContactFormSummary_projectRevision = {
      " $fragmentType": "ProjectContactFormSummary_projectRevision",
      isFirstRevision: false,
      summaryContactFormChanges: {
        edges: [
          {
            node: {
              isPristine: false,
              newFormData: {
                contactIndex: 1,
                contactId: 1,
                projectId: 1,
              },
              operation: "UPDATE",
              asProjectContact: {
                contactByContactId: {
                  fullName: "Test Full Name primary",
                },
              },
              formChangeByPreviousFormChangeId: {
                newFormData: {
                  contactIndex: 1,
                  contactId: 1,
                  projectId: 1,
                },
                asProjectContact: {
                  contactByContactId: {
                    fullName: "Test Full Name primary PREVIOUS",
                  },
                },
              },
              formByJsonSchemaName: {
                jsonSchema: projectContactProdSchema,
              },
            },
          },
          {
            node: {
              isPristine: true,
              newFormData: {
                contactIndex: 2,
                contactId: 2,
                projectId: 1,
              },
              operation: "UPDATE",
              asProjectContact: {
                contactByContactId: {
                  fullName: "I did not change",
                },
              },
              formChangeByPreviousFormChangeId: {
                newFormData: {
                  contactIndex: 1,
                  contactId: 2,
                  projectId: 1,
                },
                asProjectContact: {
                  contactByContactId: {
                    fullName: "I did not change",
                  },
                },
              },
              formByJsonSchemaName: {
                jsonSchema: projectContactProdSchema,
              },
            },
          },
          {
            node: {
              isPristine: false,
              newFormData: {
                contactIndex: 3,
                contactId: 3,
                projectId: 1,
              },
              operation: "CREATE",
              asProjectContact: {
                contactByContactId: {
                  fullName: "I was added",
                },
              },
              formChangeByPreviousFormChangeId: null,
              formByJsonSchemaName: {
                jsonSchema: projectContactProdSchema,
              },
            },
          },
          {
            node: {
              isPristine: false,
              newFormData: {
                contactIndex: 4,
                contactId: 4,
                projectId: 1,
              },
              operation: "ARCHIVE",
              formChangeByPreviousFormChangeId: {
                newFormData: {
                  contactIndex: 4,
                  contactId: 4,
                  projectId: 1,
                },
                asProjectContact: {
                  contactByContactId: {
                    fullName: "I was removed",
                  },
                },
              },
              formByJsonSchemaName: {
                jsonSchema: projectContactProdSchema,
              },
            },
          },
        ],
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
  new ComponentTestingHelper<ProjectContactFormSummaryQuery>({
    component: ProjectContactFormSummary,
    testQuery: testQuery,
    compiledQuery: compiledProjectContactFormSummaryQuery,
    getPropsFromTestQuery: (data) => ({
      query: data.query,
      projectRevision: data.query.projectRevision,
    }),
    defaultQueryResolver: mockQueryPayload,
    defaultQueryVariables: {},
    defaultComponentProps: defaultComponentProps,
  });

describe("The ProjectContactFormSummary", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    componentTestingHelper.reinit();
  });

  it("Only displays the data fields that have changed", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText("Test Full Name primary")).toBeInTheDocument();
    expect(screen.getByText("I was added")).toBeInTheDocument();
    expect(screen.getByText("I was removed")).toBeInTheDocument();
    expect(screen.queryByText("I did not change")).not.toBeInTheDocument();
  });

  it("Displays diffs of the the data fields that were updated", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText("Test Full Name primary")).toBeInTheDocument();
    expect(
      screen.getByText("Test Full Name primary PREVIOUS")
    ).toBeInTheDocument();
  });
});
