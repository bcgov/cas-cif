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
    ).toBe("50");
    expect(
      screen.getByLabelText<HTMLSelectElement>(/Holdback Percentage/i).value
    ).toBe("10");
    expect(
      screen.getByLabelText<HTMLSelectElement>(/Anticipated Funding Amount/i)
        .value
    ).toBe("$300.00");
  });

  it("loads with default value", () => {
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
                    rowId: 1,
                    changeStatus: "pending",
                    newFormData: {
                      projectId: 51,
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
    expect(
      screen.getByLabelText<HTMLSelectElement>(/Province Share Percentage/i)
        .value
    ).toBe("50");
    expect(
      screen.getByLabelText<HTMLSelectElement>(/Holdback Percentage/i).value
    ).toBe("10");
  });

  it("calls the mutation passed in with the props with the proper data on form change", async () => {
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

    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
        .variables.input
    ).toMatchObject({
      formChangePatch: {
        changeStatus: "pending",
        newFormData: expect.objectContaining({
          totalProjectValue: 10000,
        }),
      },
    });

    const maxFundingAmountField =
      screen.getByLabelText<HTMLInputElement>(/Max Funding Amount/i);

    await act(async () => {
      await waitFor(() => userEvent.clear(maxFundingAmountField));
      fireEvent.change(maxFundingAmountField, {
        target: { value: "$5000.00" },
      });
    });

    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
        .variables.input
    ).toMatchObject({
      formChangePatch: {
        changeStatus: "pending",
        newFormData: expect.objectContaining({
          totalProjectValue: 10000,
          maxFundingAmount: 5000,
        }),
      },
    });

    const provinceSharePercentageField =
      screen.getByLabelText<HTMLSelectElement>(/Province Share Percentage/i);

    await act(async () => {
      await waitFor(() => userEvent.clear(provinceSharePercentageField));
      fireEvent.change(provinceSharePercentageField, {
        target: { value: "60" },
      });
    });

    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
        .variables.input
    ).toMatchObject({
      formChangePatch: {
        changeStatus: "pending",
        newFormData: expect.objectContaining({
          totalProjectValue: 10000,
          maxFundingAmount: 5000,
          provinceSharePercentage: 60,
        }),
      },
    });

    const holdbackPercentageField =
      screen.getByLabelText<HTMLSelectElement>(/Holdback Percentage/i);

    await act(async () => {
      await waitFor(() => userEvent.clear(holdbackPercentageField));
      fireEvent.change(holdbackPercentageField, {
        target: { value: "20" },
      });
    });

    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
        .variables.input
    ).toMatchObject({
      formChangePatch: {
        changeStatus: "pending",
        newFormData: expect.objectContaining({
          totalProjectValue: 10000,
          maxFundingAmount: 5000,
          provinceSharePercentage: 60,
          holdbackPercentage: 20,
        }),
      },
    });

    const anticipatedFundingAmountField =
      screen.getByLabelText<HTMLSelectElement>(/Anticipated Funding Amount/i);

    await act(async () => {
      await waitFor(() => userEvent.clear(anticipatedFundingAmountField));
      fireEvent.change(anticipatedFundingAmountField, {
        target: { value: "1000" },
      });
    });

    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
        .variables.input
    ).toMatchObject({
      formChangePatch: {
        changeStatus: "pending",
        newFormData: expect.objectContaining({
          totalProjectValue: 10000,
          maxFundingAmount: 5000,
          provinceSharePercentage: 60,
          holdbackPercentage: 20,
          anticipatedFundingAmount: 1000,
        }),
      },
    });
  });
  it("stages the form_change when clicking on the submit button", async () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    await act(async () => {
      userEvent.click(screen.getByText(/submit/i));
    });

    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
        .variables.input
    ).toMatchObject({
      formChangePatch: { changeStatus: "staged" },
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
                    rowId: 1,
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

    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
        .variables.input
    ).toMatchObject({
      formChangePatch: { changeStatus: "staged" },
    });

    expect(componentTestingHelper.router.push).not.toHaveBeenCalled();
  });

  it("reverts the form_change status to 'pending' when editing", async () => {
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
                    rowId: 1,
                    changeStatus: "staged",
                    newFormData: {
                      projectId: 51,
                      provinceSharePercentage: 50,
                      holdbackPercentage: 10,
                      maxFundingAmount: 1000,
                      totalProjectValue: 10000,
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

    const totalProjectValueField =
      screen.getByLabelText<HTMLInputElement>(/total project value/i);

    await act(async () => {
      await waitFor(() => userEvent.clear(totalProjectValueField));
      fireEvent.change(totalProjectValueField, {
        target: { value: "$20000.00" },
      });
    });

    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
        .variables.input
    ).toMatchObject({
      formChangePatch: {
        changeStatus: "pending",
        newFormData: expect.objectContaining({
          totalProjectValue: 20000,
        }),
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
