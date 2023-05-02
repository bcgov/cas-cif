import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectForm from "components/Form/ProjectForm";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledProjectFormQuery, {
  ProjectFormQuery,
} from "__generated__/ProjectFormQuery.graphql";

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
    const result = {
      projectFormChange: {
        rank: 123,
        changeStatus: "pending",
        rowId: 1,
        id: "Test Project Form Change ID",
        formChangeByPreviousFormChangeId: null,
        isUniqueValue: true,
        asProject: {
          fundingStreamRfpByFundingStreamRfpId: {
            year: 2019,
            fundingStreamByFundingStreamId: {
              description: "Emissions Performance",
            },
          },
        },
        newFormData: {
          proposalReference: "12345678",
          summary: "d",
          operatorId: 1,
          fundingStreamRfpId: 1,
          comments: "some amendment comment",
          contractNumber: "654321",
          projectType: "project type 1",
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
      allProjectTypes: {
        edges: [
          {
            node: {
              name: "project type 1",
            },
          },
          {
            node: {
              name: "project type 2",
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
    jest.resetAllMocks();
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
          rowId: 1,
          formChangePatch: {
            newFormData: {
              proposalReference: "testidentifier",
              summary: "d",
              operatorId: 1,
              fundingStreamRfpId: 1,
              comments: "some amendment comment",
              contractNumber: "654321",
              projectType: "project type 1",
            },
          },
        },
      }
    );

    fireEvent.change(screen.getByLabelText(/Project Description/i), {
      target: { value: "testsummary" },
    });

    componentTestingHelper.expectMutationToBeCalled(
      "updateProjectFormChangeMutation",
      {
        input: {
          rowId: 1,
          formChangePatch: {
            newFormData: {
              proposalReference: "testidentifier",
              summary: "testsummary",
              operatorId: 1,
              fundingStreamRfpId: 1,
              comments: "some amendment comment",
              contractNumber: "654321",
              projectType: "project type 1",
            },
          },
        },
      }
    );
  });

  it("loads with the correct initial form data", () => {
    componentTestingHelper.loadQuery();

    componentTestingHelper.renderComponent();
    // Also ensures that funding stream is read only
    expect(screen.getAllByRole("definition")[0]).toHaveTextContent(
      /Emissions Performance - 2019/i
    );
    expect(
      screen.getByLabelText<HTMLInputElement>("Proposal Reference").value
    ).toBe("12345678");
    expect(
      screen.getByLabelText<HTMLInputElement>("Project Description").value
    ).toBe("d");
    expect(
      screen.getByPlaceholderText<HTMLSelectElement>("Select an Operator").value
    ).toBe("test operator (1234abcd)");
    expect(
      screen.getByLabelText<HTMLSelectElement>("General Comments").value
    ).toBe("some amendment comment");
    expect(
      screen.getByPlaceholderText<HTMLSelectElement>(/Select a Project Type/)
        .value
    ).toBe("project type 1");
    expect(screen.getByLabelText("Rank")).toHaveTextContent("123");
  });

  it("Displays an error message upon validation when the proposal reference is not unique", () => {
    const mockResolver = {
      ...mockQueryPayload,
      ProjectRevision() {
        const result = {
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
        const result = {
          projectFormChange: {
            id: "Test Project Form Change ID",
            isUniqueValue: true,
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

    act(() => {
      screen.getByText(/submit/i).click();
    });
    componentTestingHelper.expectMutationToBeCalled("stageFormChangeMutation", {
      input: {
        rowId: 42,
        formChangePatch: {},
      },
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

    act(() => {
      screen.getByText(/submit/i).click();
    });
    componentTestingHelper.expectMutationToBeCalled("stageFormChangeMutation", {
      input: {
        rowId: 42,
        formChangePatch: {},
      },
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

    act(() => {
      screen.getByText(/submit/i).click();
    });

    componentTestingHelper.expectMutationToBeCalled("stageFormChangeMutation", {
      input: {
        rowId: 42,
        formChangePatch: {},
      },
    });
  });

  it("reverts the form_change status to 'pending' when editing", () => {
    const mockResolver = {
      ...mockQueryPayload,
      ProjectRevision() {
        const result = {
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

    componentTestingHelper.expectMutationToBeCalled(
      "updateProjectFormChangeMutation",
      {
        input: {
          rowId: 42,
          formChangePatch: {
            newFormData: {
              proposalReference: "12345678",
              summary: "d",
              operatorId: 1,
              fundingStreamRfpId: 1,
              projectName: "test project name2",
              totalFundingRequest: 12345,
            },
          },
        },
      }
    );
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

    componentTestingHelper.expectMutationToBeCalled(
      "updateProjectFormChangeMutation",
      {
        input: {
          rowId: 1,
          formChangePatch: {
            newFormData: {
              proposalReference: "12345678",
              summary: "d",
              operatorId: 1,
              fundingStreamRfpId: 1,
              comments: "some amendment comment",
              contractNumber: "654321",
              projectType: "project type 1",
              sectorName: "test sector 1",
            },
          },
        },
      }
    );
  });

  it("displays a project type dropdown with selectable choices", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(
      screen.getByLabelText<HTMLInputElement>("Project Type (optional)")
    ).toBeInTheDocument();

    act(() => {
      userEvent.click(screen.getAllByLabelText(/project type/i)[0]);
    });

    expect(screen.getByText(/project type 1/i)).toBeInTheDocument();

    expect(screen.getByText(/project type 2/i)).toBeInTheDocument();

    act(() => {
      userEvent.click(screen.getByText(/project type 2/i));
    });

    componentTestingHelper.expectMutationToBeCalled(
      "updateProjectFormChangeMutation",
      {
        input: {
          rowId: 1,
          formChangePatch: {
            newFormData: {
              proposalReference: "12345678",
              summary: "d",
              operatorId: 1,
              fundingStreamRfpId: 1,
              comments: "some amendment comment",
              contractNumber: "654321",
              projectType: "project type 2",
            },
          },
        },
      }
    );
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
