import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectFundingAgreementForm from "components/Form/ProjectFundingAgreementForm";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledFormIndexPageQuery, {
  FormIndexPageQuery,
} from "__generated__/FormIndexPageQuery.graphql";
import { ProjectFundingAgreementForm_projectRevision$data } from "__generated__/ProjectFundingAgreementForm_projectRevision.graphql";

const testQuery = graphql`
  query ProjectFundingAgreementFormQuery @relay_test_operation {
    query {
      ...ProjectFundingAgreementForm_query
      # Spread the fragment you want to test here
      projectRevision(id: "Test Project Revision ID") {
        ...ProjectFundingAgreementForm_projectRevision
      }
    }
  }
`;

const defaultMockResolver = {
  ProjectRevision() {
    const result: Partial<ProjectFundingAgreementForm_projectRevision$data> = {
      " $fragmentType": "ProjectFundingAgreementForm_projectRevision",
      id: "Test Project Revision ID",
      rowId: 1234,
      projectFormChange: {
        formDataRecordId: 51,
      },
      projectFundingAgreementFormChanges: {
        __id: "connection Id",
        edges: [
          {
            node: {
              id: "Test Form Change ID 1",
              rowId: 1,
              changeStatus: "pending",
              newFormData: {
                projectId: 51,
                totalProjectValue: 400,
                maxFundingAmount: 200,
                provinceSharePercentage: 50,
                holdbackPercentage: 10,
                anticipatedFundingAmount: 300,
                proponentCost: 800,
              },
            },
          },
        ],
      },
      additionalFundingSourceFormChanges: {
        __id: "connection Id",
        edges: [
          {
            node: {
              id: "Additional Funding Source Test Form Change ID 1",
              rowId: 789,
              changeStatus: "pending",
              operation: "CREATE",
              newFormData: {
                projectId: 51,
                sourceIndex: 1,
                source: "Test Source 1",
                amount: 100,
                status: "Approved",
              },
            },
          },
        ],
      },
    };
    return result;
  },
  Query() {
    return {
      allAdditionalFundingSourceStatuses: {
        edges: [
          {
            node: {
              rowId: 1,
              statusName: "Awaiting Approval",
            },
          },
          {
            node: {
              rowId: 2,
              statusName: "Approved",
            },
          },
          {
            node: {
              rowId: 3,
              statusName: "Denied",
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
  component: ProjectFundingAgreementForm,
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

describe("The ProjectFundingAgreementForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    componentTestingHelper.reinit();
  });

  it("loads with the correct initial form data", () => {
    componentTestingHelper.loadQuery();

    componentTestingHelper.renderComponent();

    expect(
      screen.getByLabelText<HTMLInputElement>(/total project value/i).value
    ).toBe("$400.00");
    expect(
      screen.getByLabelText<HTMLInputElement>(/Max Funding Amount/i).value
    ).toBe("$200.00");
    expect(
      screen.getByLabelText<HTMLSelectElement>(/Province Share Percentage/i)
        .value
    ).toBe("50 %");
    expect(
      screen.getByLabelText<HTMLSelectElement>(/Holdback Percentage/i).value
    ).toBe("10 %");
    expect(
      screen.getByLabelText<HTMLSelectElement>(/Anticipated Funding Amount/i)
        .value
    ).toBe("$300.00");
    expect(
      screen.getByLabelText<HTMLSelectElement>(/Proponent Cost/i).value
    ).toBe("$800.00");

    // Additional Funding Source section
    expect(
      screen.getByRole<HTMLInputElement>("textbox", {
        name: /additional funding source/i,
      }).value
    ).toBe("Test Source 1");
    expect(
      screen.getByRole<HTMLInputElement>("textbox", {
        name: /additional funding amount/i,
      }).value
    ).toBe("$100.00");
    expect(
      screen.getByRole<HTMLInputElement>("combobox", {
        name: /additional funding status/i,
      }).value
    ).toBe("Approved");

    expect(screen.getAllByRole("button", { name: /remove/i })).toHaveLength(1);
    expect(
      screen.getByRole("button", {
        name: /add funding source/i,
      })
    ).toBeInTheDocument();
  });

  it("calls the update mutation when entering funding agreement data", async () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    const totalProjectValueField =
      screen.getByLabelText<HTMLInputElement>(/total project value/i);

    await act(async () => {
      await waitFor(() => userEvent.clear(totalProjectValueField));
      fireEvent.change(totalProjectValueField, {
        target: { value: "$10000.00" },
      });
    });

    componentTestingHelper.expectMutationToBeCalled(
      "updateFormChangeMutation",
      {
        input: {
          rowId: 1,
          formChangePatch: {
            newFormData: expect.objectContaining({
              totalProjectValue: 10000,
            }),
          },
        },
      }
    );
  });

  it("calls the update mutation when entering additional funding source data", async () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    const additionalFundingSourceField = screen.getByRole<HTMLInputElement>(
      "textbox",
      {
        name: /additional funding source/i,
      }
    );

    await act(async () => {
      await waitFor(() => userEvent.clear(additionalFundingSourceField));
      fireEvent.change(additionalFundingSourceField, {
        target: { value: "Test Source Updated" },
      });
    });

    componentTestingHelper.expectMutationToBeCalled(
      "updateFormChangeMutation",
      {
        input: {
          rowId: 789,
          formChangePatch: {
            newFormData: expect.objectContaining({
              source: "Test Source Updated",
            }),
          },
        },
      }
    );
  });

  it("stages the form_change when clicking on the submit button", async () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    await act(async () => {
      userEvent.click(screen.getByText(/submit/i));
    });

    // The Funding Parameters
    componentTestingHelper.expectMutationToBeCalled("stageFormChangeMutation", {
      input: {
        rowId: 1,
        formChangePatch: expect.any(Object),
      },
    });

    // The additional funding source
    componentTestingHelper.expectMutationToBeCalled("stageFormChangeMutation", {
      input: {
        rowId: 789,
        formChangePatch: expect.any(Object),
      },
    });
  });

  it("clicking the submit button should stage a form with validation errors and not call the router to get to the other page", () => {
    const mockResolver = {
      ProjectRevision() {
        const result: Partial<ProjectFundingAgreementForm_projectRevision$data> =
          {
            " $fragmentType": "ProjectFundingAgreementForm_projectRevision",
            id: "Test Project Revision ID",
            rowId: 1234,
            projectFormChange: {
              formDataRecordId: 51,
            },
            projectFundingAgreementFormChanges: {
              __id: "connection Id",
              edges: [
                {
                  node: {
                    id: "Test Form Change ID 1",
                    rowId: 12,
                    changeStatus: "pending",
                    newFormData: {
                      projectId: 51,
                      provinceSharePercentage: 50,
                      holdbackPercentage: 10,
                    },
                  },
                },
              ],
            },
          };
        return result;
      },
    };

    componentTestingHelper.loadQuery(mockResolver);
    componentTestingHelper.renderComponent();

    screen.getByText(/Submit/i).click();

    componentTestingHelper.expectMutationToBeCalled("stageFormChangeMutation", {
      input: {
        rowId: 12,
        formChangePatch: expect.any(Object),
      },
    });

    expect(componentTestingHelper.router.push).not.toHaveBeenCalled();
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
        formChangesIds: [789, 1],
      },
    });
  });

  it("calls the addAdditionalFundingSourceToRevisionMutation when the user clicks the add funding source button", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    userEvent.click(screen.getByText(/add funding source/i));

    const mutationUnderTest =
      componentTestingHelper.environment.mock.getAllOperations()[1];

    expect(mutationUnderTest.fragment.node.name).toBe(
      "addAdditionalFundingSourceToRevisionMutation"
    );

    expect(mutationUnderTest.request.variables).toMatchObject({
      input: {
        revisionId: 1234,
        sourceIndex: 2,
      },
    });
  });
  it("calls the deleteFormChangeWithConnectionMutation when the user clicks the remove button", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    userEvent.click(screen.getByRole("button", { name: /remove/i }));

    const mutationUnderTest =
      componentTestingHelper.environment.mock.getAllOperations()[1];

    expect(mutationUnderTest.fragment.node.name).toBe(
      "deleteFormChangeWithConnectionMutation"
    );

    expect(mutationUnderTest.request.variables).toMatchObject({
      input: {
        id: "Additional Funding Source Test Form Change ID 1",
      },
    });
  });
});
