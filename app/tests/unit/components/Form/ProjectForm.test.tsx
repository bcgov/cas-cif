import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectForm from "components/Form/ProjectForm";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledProjectFormQuery, {
  ProjectFormQuery,
} from "__generated__/ProjectFormQuery.graphql";
import { ProjectForm_projectRevision } from "__generated__/ProjectForm_projectRevision.graphql";

const testQuery = graphql`
  query ProjectFormQuery @relay_test_operation {
    query {
      # Spread the fragment you want to test here
      ...ProjectForm_query
      projectRevision(id: "Test Project Revision ID") {
        ...ProjectForm_projectRevision
      }
    }
  }
`;

const mockQueryPayload = {
  ProjectRevision() {
    const result: Partial<ProjectForm_projectRevision> = {
      projectFormChange: {
        id: "Test Project Form Change ID",
        formChangeByPreviousFormChangeId: null,
        isUniqueValue: true,
        newFormData: {
          proposalReference: "12345678",
          summary: "d",
          operatorId: 1,
          fundingStreamRfpId: 1,
        },
      },
    };
    return result;
  },
  Query() {
    return {
      allOperators: {
        edges: [
          {
            node: {
              rowId: 1,
              legalName: "test operator",
              bcRegistryId: "1234abcd",
            },
          },
        ],
      },
      allFundingStreams: {
        edges: [
          {
            node: {
              rowId: 1,
              name: "EP",
              description: "Emissions Performance",
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

const componentTestingHelper = new ComponentTestingHelper<ProjectFormQuery>({
  component: ProjectForm,
  testQuery: testQuery,
  compiledQuery: compiledProjectFormQuery,
  getPropsFromTestQuery: (data) => ({
    query: data.query,
    projectRevision: data.query.projectRevision,
  }),
  defaultQueryResolver: mockQueryPayload,
  defaultQueryVariables: {},
  defaultComponentProps: defaultComponentProps,
});

describe("The Project Form", () => {
  beforeEach(() => {
    componentTestingHelper.reinit();
  });

  it("calls the mutation passed in with the props with the proper data on form change", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    fireEvent.change(screen.getByLabelText("Proposal Reference"), {
      target: { value: "testidentifier" },
    });

    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
        .variables
    ).toMatchObject({
      input: {
        id: expect.any(String),
        formChangePatch: {
          newFormData: expect.objectContaining({
            proposalReference: "testidentifier",
          }),
        },
      },
    });

    fireEvent.change(screen.getByLabelText(/summary/i), {
      target: { value: "testsummary" },
    });

    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
        .variables
    ).toMatchObject({
      input: {
        id: expect.any(String),
        formChangePatch: {
          newFormData: expect.objectContaining({
            proposalReference: "testidentifier",
            summary: "testsummary",
          }),
        },
      },
    });
  });
  it("loads with the correct initial form data", () => {
    componentTestingHelper.loadQuery();

    componentTestingHelper.renderComponent();

    expect(
      screen.getByLabelText<HTMLInputElement>("Proposal Reference").value
    ).toBe("12345678");
    expect(screen.getByLabelText<HTMLInputElement>("Summary").value).toBe("d");
    expect(
      screen.getByPlaceholderText<HTMLSelectElement>("Select an Operator").value
    ).toBe("test operator (1234abcd)");
  });
  it("Displays an error message upon validation when the proposal reference is not unique", () => {
    const mockResolver = {
      ...mockQueryPayload,
      ProjectRevision() {
        const result: Partial<ProjectForm_projectRevision> = {
          projectFormChange: {
            id: "Test Project Form Change ID",
            formChangeByPreviousFormChangeId: null,
            isUniqueValue: false,
            newFormData: {
              proposalReference: "12345678",
              summary: "d",
              operatorId: 1,
              fundingStreamRfpId: 1,
            },
          },
        };
        return result;
      },
    };

    componentTestingHelper.loadQuery(mockResolver);
    componentTestingHelper.renderComponent();

    act(() => {
      userEvent.click(screen.getByText(/submit/i));
    });

    expect(
      screen.getByText(
        /This proposal reference already exists, please specify a different one./i
      )
    ).toBeInTheDocument();
  });

  it("stages the form_change when clicking on the submit button", () => {
    componentTestingHelper.loadQuery({
      ProjectRevision() {
        const result: Partial<ProjectForm_projectRevision> = {
          projectFormChange: {
            id: "Test Project Form Change ID",
            isUniqueValue: true,
            formChangeByPreviousFormChangeId: null,
            newFormData: {
              proposalReference: "12345678",
              summary: "d",
              operatorId: 1,
              fundingStreamRfpId: 1,
              projectName: "test project name",
              totalFundingRequest: 12345,
              projectStatusId: 1,
              operatorTradeName: "test trade name",
            },
          },
        };
        return result;
      },
      Query() {
        const query = {
          allOperators: {
            edges: [
              {
                node: {
                  rowId: 1,
                  legalName: "test operator",
                  bcRegistryId: "1234abcd",
                },
              },
            ],
          },
          allFundingStreams: {
            edges: [
              {
                node: {
                  rowId: 1,
                  name: "EP",
                  description: "Emissions Performance",
                },
              },
            ],
          },
        };
        return query;
      },
    });

    componentTestingHelper.renderComponent();

    screen.getByText(/submit/i).click();
    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
        .variables.input
    ).toMatchObject({
      formChangePatch: { changeStatus: "staged" },
    });
  });
  it("clicking the submit button should stage a form with validation errors", () => {
    const mockResolver = {
      ...mockQueryPayload,
      ProjectRevision() {
        return {
          id: "Test Project Revision ID",
          projectFormChange: {
            id: "Test Project Form Change ID",
            isUniqueValue: true,
            changeStatus: "pending",
            newFormData: {
              proposalReference: "12345678",
              summary: "d",
              operatorId: 1,
              fundingStreamRfpId: 1,
              projectName: "test project name",
              totalFundingRequest: null,
            },
          },
        };
      },
    };

    componentTestingHelper.loadQuery(mockResolver);
    componentTestingHelper.renderComponent();

    screen.getByText(/submit/i).click();
    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
        .variables.input
    ).toMatchObject({
      formChangePatch: { changeStatus: "staged" },
    });
  });
  it("reverts the form_change status to 'pending' when editing", () => {
    const mockResolver = {
      ...mockQueryPayload,
      ProjectRevision() {
        const result: Partial<ProjectForm_projectRevision> = {
          projectFormChange: {
            id: "Test Project Form Change ID",
            isUniqueValue: true,
            formChangeByPreviousFormChangeId: null,
            newFormData: {
              proposalReference: "12345678",
              summary: "d",
              operatorId: 1,
              fundingStreamRfpId: 1,
              projectName: "test project name",
              totalFundingRequest: 12345,
            },
          },
        };
        return result;
      },
    };

    componentTestingHelper.loadQuery(mockResolver);
    componentTestingHelper.renderComponent();

    act(() => {
      userEvent.type(screen.getByLabelText(/project name/i), "2");
    });

    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
        .variables.input
    ).toMatchObject({
      formChangePatch: {
        changeStatus: "pending",
        newFormData: { projectName: "test project name2" },
      },
    });
  });
});
