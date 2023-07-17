import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectFundingAgreementForm from "components/Form/ProjectFundingAgreementForm";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledFormIndexPageQuery, {
  FormIndexPageQuery,
} from "__generated__/FormIndexPageQuery.graphql";
import { ProjectFundingAgreementForm_projectRevision$data } from "__generated__/ProjectFundingAgreementForm_projectRevision.graphql";
import projectFundingParameterEPSchema from "/schema/data/prod/json_schema/funding_parameter_EP.json";
import projectFundingParameterIASchema from "/schema/data/prod/json_schema/funding_parameter_IA.json";

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
      projectFormChange: {
        formDataRecordId: 51,
        asProject: {
          fundingStreamRfpByFundingStreamRfpId: {
            fundingStreamByFundingStreamId: {
              name: "EP",
            },
          },
        },
      },

      id: "Test Project Revision ID",
      rowId: 1234,
      projectFundingAgreementFormChanges: {
        __id: "connection Id",
        edges: [
          {
            node: {
              id: "Test Form Change ID 1",
              rowId: 999999999,
              changeStatus: "pending",
              eligibleExpensesToDate: "5",
              holdbackAmountToDate: "6",
              netPaymentsToDate: "7",
              grossPaymentsToDate: "8",
              totalProjectValue: 12,
              proponentsSharePercentage: 3.65,
              anticipatedFundingAmountPerFiscalYear: {
                edges: [
                  {
                    node: {
                      anticipatedFundingAmount: "5",
                      fiscalYear: "2021/2022",
                    },
                  },
                ],
              },
              newFormData: {
                projectId: 51,
                maxFundingAmount: 200,
                provinceSharePercentage: 50,
                holdbackPercentage: 10.23,
                anticipatedFundingAmount: 300,
                proponentCost: 800,
                contractStartDate: "2021-01-01",
                projectAssetsLifeEndDate: "2021-12-31",
                additionalFundingSources: [
                  {
                    source: "Test Source 1",
                    amount: 100,
                    status: "Approved",
                  },
                ],
              },
            },
          },
        ],
      },
    };
    return result;
  },
  Form() {
    return {
      rowId: 15,
      jsonSchema: projectFundingParameterEPSchema,
    };
  },
  Query() {
    return {
      rowId: 30,
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

const iaMockResolver = {
  ProjectRevision() {
    const result: Partial<ProjectFundingAgreementForm_projectRevision$data> = {
      " $fragmentType": "ProjectFundingAgreementForm_projectRevision",
      projectFormChange: {
        formDataRecordId: 51,
        asProject: {
          fundingStreamRfpByFundingStreamRfpId: {
            fundingStreamByFundingStreamId: {
              name: "IA",
            },
          },
        },
      },
      formChangesByProjectRevisionId: {
        edges: [
          {
            node: {
              anticipatedFundingAmountPerFiscalYear: {
                edges: [
                  {
                    node: {
                      anticipatedFundingAmount: "5",
                      fiscalYear: "2021/2022",
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      totalProjectValue: "350",
      id: "Test Project Revision ID",
      rowId: 1234,
      projectFundingAgreementFormChanges: {
        __id: "connection Id",
        edges: [
          {
            node: {
              id: "Test Form Change ID 1",
              rowId: 1,
              changeStatus: "pending",
              calculatedTotalPaymentAmountToDate: 160,
              totalProjectValue: 350,
              proponentsSharePercentage: 228.57,
              newFormData: {
                projectId: 51,
                maxFundingAmount: 200,
                provinceSharePercentage: 50,
                holdbackPercentage: 10.23,
                anticipatedFundingAmount: 300,
                proponentCost: 800,
                contractStartDate: "2021-01-01",
                projectAssetsLifeEndDate: "2021-12-31",
                additionalFundingSources: [
                  {
                    source: "Test Source IA",
                    amount: 100,
                    status: "Approved",
                  },
                ],
              },
            },
          },
        ],
      },
    };
    return result;
  },
  Form() {
    return {
      jsonSchema: projectFundingParameterIASchema,
    };
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
    jest.resetAllMocks();
    componentTestingHelper.reinit();
  });

  it("loads with the correct initial form data for an EP project", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    expect(
      screen.getByLabelText<HTMLLabelElement>(/total project value/i)
    ).toHaveTextContent("$12.00");
    expect(
      screen.getByLabelText<HTMLInputElement>(/Maximum Funding Amount/i).value
    ).toBe("$200.00");
    expect(
      screen.getByLabelText<HTMLSelectElement>(/Province's Share Percentage/i)
        .value
    ).toBe("50.00 %");
    expect(
      screen.getByLabelText<HTMLSelectElement>(
        /Performance Milestone Holdback Percentage/i
      ).value
    ).toBe("10.23 %");
    expect(
      screen.getByLabelText<HTMLSelectElement>(
        /Anticipated\/Actual Funding Amount/i
      ).value
    ).toBe("$300.00");
    expect(
      screen.getByLabelText<HTMLLabelElement>(
        /Anticipated Funding Amount Per Fiscal Year 1 \(2021\/2022\)/i
      )
    ).toHaveTextContent("$5.00");
    expect(
      screen.getByLabelText<HTMLSelectElement>(/Proponent Cost/i).value
    ).toBe("$800.00");
    expect(
      screen.getByLabelText<HTMLSelectElement>(/Proponent's Share Percentage/i)
    ).toHaveTextContent("3.65%");
    expect(
      screen.getByLabelText<HTMLInputElement>(/Contract Start Date/i)
    ).toHaveTextContent(/Jan[.]? 01, 2021/);
    expect(
      screen.getByLabelText<HTMLInputElement>(/Project Assets Life End Date/i)
    ).toHaveTextContent(/Dec[.]? 31, 2021/);

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

    // Expenses & Payments Tracker Section
    expect(
      screen.queryByLabelText<HTMLSelectElement>(
        /total payment amount to date/i
      )
    ).not.toBeInTheDocument();
    expect(
      screen.getByLabelText<HTMLSelectElement>(
        /total eligible expenses to date/i
      )
    ).toHaveTextContent("$5.00");
    expect(
      screen.getByLabelText<HTMLSelectElement>(
        /total gross payment amount to date/i
      )
    ).toHaveTextContent("$8.00");
    expect(
      screen.getByLabelText<HTMLSelectElement>(/total holdback amount to date/i)
    ).toHaveTextContent("$6.00");
    expect(
      screen.getByLabelText<HTMLSelectElement>(
        /total net payment amount to date/i
      )
    ).toHaveTextContent("$7.00");
  });

  it("loads with the correct initial form data for an IA project", () => {
    componentTestingHelper.loadQuery({
      ProjectRevision() {
        const result: Partial<ProjectFundingAgreementForm_projectRevision$data> =
          {
            " $fragmentType": "ProjectFundingAgreementForm_projectRevision",
            projectFormChange: {
              formDataRecordId: 51,
              asProject: {
                fundingStreamRfpByFundingStreamRfpId: {
                  fundingStreamByFundingStreamId: {
                    name: "IA",
                  },
                },
              },
            },

            totalProjectValue: "350",
            id: "Test Project Revision ID",
            rowId: 1234,
            projectFundingAgreementFormChanges: {
              __id: "connection Id",
              edges: [
                {
                  node: {
                    id: "Test Form Change ID 1",
                    rowId: 1,
                    changeStatus: "pending",
                    calculatedTotalPaymentAmountToDate: 160,
                    totalProjectValue: 350,
                    proponentsSharePercentage: 228.57,
                    anticipatedFundingAmountPerFiscalYear: {
                      edges: [
                        {
                          node: {
                            anticipatedFundingAmount: "5",
                            fiscalYear: "2021/2022",
                          },
                        },
                      ],
                    },
                    newFormData: {
                      projectId: 51,
                      maxFundingAmount: 200,
                      provinceSharePercentage: 50,
                      holdbackPercentage: 10.23,
                      anticipatedFundingAmount: 300,
                      proponentCost: 800,
                      contractStartDate: "2021-01-01",
                      projectAssetsLifeEndDate: "2021-12-31",
                      additionalFundingSources: [
                        {
                          source: "Test Source IA",
                          amount: 100,
                          status: "Approved",
                        },
                      ],
                    },
                  },
                },
              ],
            },
          };
        return result;
      },
      Form() {
        return {
          jsonSchema: projectFundingParameterIASchema,
        };
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
    });
    componentTestingHelper.renderComponent();
    expect(
      screen.getByLabelText<HTMLLabelElement>(/total project value/i)
    ).toHaveTextContent("$350.00");
    expect(
      screen.getByLabelText<HTMLInputElement>(/Maximum Funding Amount/i).value
    ).toBe("$200.00");
    expect(
      screen.getByLabelText<HTMLSelectElement>(/Province's Share Percentage/i)
        .value
    ).toBe("50.00 %");
    expect(
      screen.queryByLabelText<HTMLSelectElement>(
        /Performance Milestone Holdback Percentage/i
      )
    ).not.toBeInTheDocument();
    expect(
      screen.getByLabelText<HTMLSelectElement>(
        /Anticipated\/Actual Funding Amount/i
      ).value
    ).toBe("$300.00");
    expect(
      screen.getByLabelText<HTMLLabelElement>(
        /Anticipated Funding Amount Per Fiscal Year 1 \(2021\/2022\)/i
      )
    ).toHaveTextContent("$5.00");
    expect(
      screen.getByLabelText<HTMLSelectElement>(/Proponent Cost/i).value
    ).toBe("$800.00");
    expect(
      screen.getByLabelText<HTMLSelectElement>(/Proponent's Share Percentage/i)
    ).toHaveTextContent("228.57%");
    expect(
      screen.getByLabelText<HTMLInputElement>(/Contract Start Date/i)
    ).toHaveTextContent(/Jan[.]? 01, 2021/);
    expect(
      screen.getByLabelText<HTMLInputElement>(/Project Assets Life End Date/i)
    ).toHaveTextContent(/Dec[.]? 31, 2021/);

    // Additional Funding Source section
    expect(
      screen.getByRole<HTMLInputElement>("textbox", {
        name: /additional funding source/i,
      }).value
    ).toBe("Test Source IA");
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

    // Expenses & Payments Tracker Section

    expect(
      screen.queryByLabelText<HTMLSelectElement>(
        /total eligible expenses to date/i
      )
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText<HTMLSelectElement>(
        /total gross payment amount to date/i
      )
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText<HTMLSelectElement>(
        /total holdback amount to date/i
      )
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText<HTMLSelectElement>(
        /total net payment amount to date/i
      )
    ).not.toBeInTheDocument();
    expect(
      screen.getByLabelText<HTMLSelectElement>(/total payment amount to date/i)
    ).toHaveTextContent("$160.00");
  });

  it("calls the update mutation when entering funding agreement data", async () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    const proponentCostField =
      screen.getByLabelText<HTMLInputElement>(/proponent cost/i);

    await act(async () => {
      await waitFor(() => userEvent.clear(proponentCostField));
      fireEvent.change(proponentCostField, {
        target: { value: "$10000.00" },
      });
    });

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
      "updateFundingParameterFormChangeMutation",
      {
        input: {
          rowId: 999999999,
          formChangePatch: {
            newFormData: expect.objectContaining({
              proponentCost: 10000,
              additionalFundingSources: [
                expect.objectContaining({ source: "Test Source Updated" }),
              ],
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
        rowId: 999999999,
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
                      holdbackPercentage: 10.23,
                    },
                  },
                },
              ],
            },
          };
        return result;
      },
      Form() {
        return {
          jsonSchema: projectFundingParameterEPSchema,
        };
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

    componentTestingHelper.expectMutationToBeCalled("undoFormChangesMutation", {
      input: {
        formChangesIds: [999999999],
      },
    });
  });

  it("renders the tooltips for the EP form", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(
      screen.getAllByRole("tooltip", {
        name: "maximum-funding-amount-tooltip",
      })
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("tooltip", {
        name: "province's-share-percentage-tooltip",
      })
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("tooltip", {
        name: "performance-milestone-holdback-percentage-tooltip",
      })
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("tooltip", {
        name: "proponent-cost-tooltip",
      })
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("tooltip", {
        name: "proponent's-share-percentage-tooltip",
      })
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("tooltip", {
        name: "total-project-value-tooltip",
      })
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("tooltip", {
        name: "additional-funding-amount-tooltip",
      })
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("tooltip", {
        name: "total-net-payment-amount-to-date-tooltip",
      })
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("tooltip", {
        name: "total-gross-payment-amount-to-date-tooltip",
      })
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("tooltip", {
        name: "total-holdback-amount-to-date-tooltip",
      })
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("tooltip", {
        name: "total-eligible-expenses-to-date-tooltip",
      })
    ).toHaveLength(1);
  });

  it("renders the tooltips for the IA form", () => {
    componentTestingHelper.loadQuery(iaMockResolver);
    componentTestingHelper.renderComponent();

    expect(
      screen.getAllByRole("tooltip", {
        name: "maximum-funding-amount-tooltip",
      })
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("tooltip", {
        name: "province's-share-percentage-tooltip",
      })
    ).toHaveLength(1);

    expect(
      screen.getAllByRole("tooltip", {
        name: "proponent-cost-tooltip",
      })
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("tooltip", {
        name: "proponent's-share-percentage-tooltip",
      })
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("tooltip", {
        name: "total-project-value-tooltip",
      })
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("tooltip", {
        name: "additional-funding-amount-tooltip",
      })
    ).toHaveLength(1);
  it("after selecting No, the submit button should allow the user to navigate away from the page", () => {
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
              edges: [],
            },
          };
        return result;
      },
      Form() {
        return {
          jsonSchema: projectFundingParameterEPSchema,
        };
      },
    };

    componentTestingHelper.loadQuery(mockResolver);
    componentTestingHelper.renderComponent();

    expect(screen.getByText("Is this a funded project?")).toBeInTheDocument();
    const submitButton = screen.getByText(/Submit/i);
    expect(submitButton).toBeDisabled();

    const radioButton = screen.getByLabelText("No");
    userEvent.click(radioButton);
    expect(submitButton).toBeEnabled();
    userEvent.click(submitButton);

    expect(componentTestingHelper.router.push).toHaveBeenCalled();
  });
});
