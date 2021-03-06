import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectForm from "components/Form/ProjectForm";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledProjectFormQuery, {
  ProjectFormQuery,
} from "__generated__/ProjectFormQuery.graphql";
import { ProjectForm_projectRevision$data } from "__generated__/ProjectForm_projectRevision.graphql";

const testQuery = graphql`
  query ProjectFormQuery @relay_test_operation {
    # Spread the fragment you want to test here
    ...ProjectForm_query
    projectRevision(id: "Test Project Revision ID") {
      ...ProjectForm_projectRevision
    }
  }
`;

const mockQueryPayload = {
  ProjectRevision() {
    const result: Partial<ProjectForm_projectRevision$data> = {
      projectFormChange: {
        changeStatus: "pending",
        rowId: 1,
        id: "Test Project Form Change ID",
        formChangeByPreviousFormChangeId: null,
        isUniqueValue: true,
        newFormData: {
          proposalReference: "12345678",
          summary: "d",
          operatorId: 1,
          fundingStreamRfpId: 1,
          comments: "some amendment comment",
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
      allSectors: {
        edges: [
          {
            node: {
              sectorName: "test sector 1",
            },
          },
          {
            node: {
              sectorName: "test sector 2",
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
    query: data,
    projectRevision: data.projectRevision,
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

    componentTestingHelper.expectMutationToBeCalled(
      "updateProjectFormChangeMutation",
      {
        input: {
          id: expect.any(String),
          formChangePatch: {
            changeStatus: "pending",
            newFormData: expect.objectContaining({
              proposalReference: "testidentifier",
            }),
          },
        },
      }
    );

    fireEvent.change(screen.getByLabelText(/summary/i), {
      target: { value: "testsummary" },
    });

    componentTestingHelper.expectMutationToBeCalled(
      "updateProjectFormChangeMutation",
      {
        input: {
          id: expect.any(String),
          formChangePatch: {
            changeStatus: "pending",
            newFormData: expect.objectContaining({
              proposalReference: "testidentifier",
              summary: "testsummary",
            }),
          },
        },
      }
    );

    fireEvent.change(screen.getByLabelText(/General Comments/i), {
      target: { value: "new comment" },
    });

    componentTestingHelper.expectMutationToBeCalled(
      "updateProjectFormChangeMutation",
      {
        input: {
          id: expect.any(String),
          formChangePatch: {
            changeStatus: "pending",
            newFormData: expect.objectContaining({
              proposalReference: "testidentifier",
              summary: "testsummary",
              comments: "new comment",
            }),
          },
        },
      }
    );
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
    expect(
      screen.getByLabelText<HTMLSelectElement>("General Comments").value
    ).toBe("some amendment comment");
  });
  it("Displays an error message upon validation when the proposal reference is not unique", () => {
    const mockResolver = {
      ...mockQueryPayload,
      ProjectRevision() {
        const result: Partial<ProjectForm_projectRevision$data> = {
          projectFormChange: {
            changeStatus: "pending",
            rowId: 1,
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
        const result: Partial<ProjectForm_projectRevision$data> = {
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

  it("stages a formChange with null newFormData", () => {
    const mockResolver = {
      ...mockQueryPayload,
      ProjectRevision() {
        return {
          id: "Test Project Revision ID",
          projectFormChange: {
            id: "Test Project Form Change ID",
            isUniqueValue: true,
            changeStatus: "pending",
            newFormData: null,
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
        const result: Partial<ProjectForm_projectRevision$data> = {
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

  it("displays a sector dropdown with selectable choices", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(
      screen.getByLabelText<HTMLInputElement>("Sector")
    ).toBeInTheDocument();

    act(() => {
      userEvent.click(screen.getAllByLabelText(/Sector/i)[0]);
    });

    expect(screen.getByText(/test sector 1/i)).toBeInTheDocument();

    expect(screen.getByText(/test sector 2/i)).toBeInTheDocument();

    act(() => {
      userEvent.click(screen.getByText(/test sector 1/i));
    });

    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
        .variables.input
    ).toMatchObject({
      formChangePatch: {
        changeStatus: "pending",
        newFormData: { sectorName: "test sector 1" },
      },
    });
  });
  it("calls the undoFormChangesMutation when the user clicks the Undo Changes button", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    userEvent.click(screen.getByText(/Undo Changes/i));

    expect(
      componentTestingHelper.environment.mock.getAllOperations()
    ).toHaveLength(2);

    const mutationUnderTest =
      componentTestingHelper.environment.mock.getAllOperations()[1];

    expect(mutationUnderTest.fragment.node.name).toBe(
      "undoFormChangesMutation"
    );
    expect(mutationUnderTest.request.variables).toMatchObject({
      input: {
        formChangesIds: [1],
      },
    });
  });
});
