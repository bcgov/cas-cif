import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectEmissionIntensityReportForm from "components/Form/ProjectEmissionIntensityReportForm";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledFormIndexPageQuery, {
  FormIndexPageQuery,
} from "__generated__/FormIndexPageQuery.graphql";
import emissionsIntensityProdSchema from "/schema/data/prod/json_schema/emission_intensity.json";

const testQuery = graphql`
  query ProjectEmissionIntensityReportFormQuery @relay_test_operation {
    query {
      # Spread the fragment you want to test here
      ...ProjectEmissionIntensityReportForm_query
      projectRevision(id: "Test Project Revision ID") {
        ...ProjectEmissionIntensityReportForm_projectRevision
      }
    }
  }
`;

const defaultMockResolver = {
  ProjectRevision(context, generateID) {
    return {
      emissionIntensityReportingRequirementFormChange: {
        edges: [
          {
            node: {
              id: `mock-emission-intensity-report-form-${generateID()}`,
              rowId: 1,
              newFormData: {
                reportDueDate: "2022-01-01",
                projectId: 51,
                reportType: "TEIMP",
                comments: "general comments",
                reportingRequirementIndex: 1,
                measurementPeriodStartDate: "2022-01-02",
                measurementPeriodEndDate: "2023-01-02",
                emissionFunctionalUnit: "tCO2e",
                productionFunctionalUnit: "GJ",
                baselineEmissionIntensity: "2",
                targetEmissionIntensity: "3",
                postProjectEmissionIntensity: "4",
                totalLifetimeEmissionReduction: "5",
                adjustedEmissionsIntensityPerformance: "6",
                dateSentToCsnr: "2022-02-11",
              },
              operation: "CREATE",
              changeStatus: "pending",
              reportType: "TEIMP",
              formChangeByPreviousFormChangeId: null,
              formDataRecordId: 1,

              calculatedEiPerformance: 200,
              paymentPercentage: 60,
              holdbackAmountToDate: "100",
              actualPerformanceMilestoneAmount: "200",
            },
          },
        ],
        __id: "client:mock:__connection_emissionIntensityReportingRequirementFormChange_connection",
      },
    };
  },
  Form() {
    return {
      jsonSchema: emissionsIntensityProdSchema,
    };
  },
  Query() {
    return {
      allReportTypes: {
        edges: [
          {
            node: {
              name: "TEIMP",
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
  component: ProjectEmissionIntensityReportForm,
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

  it("renders a create button that calls the addEmissionIntensityReportToRevision mutation, when there is no report on that project revision", () => {
    const mockResolver = {
      ...defaultMockResolver,
      ProjectRevision(context, generateID) {
        return {
          ...defaultMockResolver.ProjectRevision(context, generateID),

          emissionIntensityReportingRequirementFormChange: {
            edges: [],
            __id: "client:mock:__connection_emissionIntensityReportingRequirementFormChange_connection",
          },
        };
      },
    };
    componentTestingHelper.loadQuery(mockResolver);
    componentTestingHelper.renderComponent();
    expect(
      screen.getByText("Add Emissions Intensity Report")
    ).toBeInTheDocument();
    userEvent.click(screen.getByText("Add Emissions Intensity Report"));
    const mutationUnderTest =
      componentTestingHelper.environment.mock.getAllOperations()[1];
    expect(mutationUnderTest.fragment.node.name).toBe(
      "createEmissionIntensityReportMutation"
    );
  });

  it("renders the the reporting requirement and TEIMP forms", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    expect(screen.getByLabelText("Report Due Date")).toHaveTextContent(
      /Jan[.]? 01, 2022/
    );
    expect(screen.getByLabelText("Report Received Date")).toHaveTextContent(
      /Select a date/i
    );
    expect(screen.getByLabelText("General Comments")).toHaveTextContent(
      /general comments/
    );
    expect(screen.getByLabelText(/TEIMP start date/i)).toHaveTextContent(
      /Jan[.]? 02, 2022/
    );
    expect(screen.getByLabelText(/TEIMP end date/i)).toHaveTextContent(
      /Jan[.]? 02, 2023/
    );
    expect(screen.getByText(/duration: 12 months/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Functional unit$/i)).toHaveValue("tCO2e");
    expect(
      screen.getByLabelText(/Baseline Emission Intensity \(BEI\)/)
    ).toHaveValue("2");
    expect(
      screen.getByLabelText(/Target Emission Intensity \(TEI\)/i)
    ).toHaveValue("3");
    expect(
      screen.getByLabelText(/Post-Project Emission Intensity \(PEI\)*/i)
    ).toHaveValue("4");
    expect(
      screen.getByLabelText(/Total Project Lifetime Emissions Reductions*/i)
    ).toHaveValue("5");
    // We can't query by label for text elements,
    // See 'note' field here https://testing-library.com/docs/queries/bylabeltext/#options
    expect(
      screen.getByLabelText("GHG Emission Intensity Performance").closest("div")
    ).toHaveTextContent("200.00%");
    expect(
      screen
        .getByLabelText("GHG Emission Intensity Performance (Adjusted)")
        .closest("div")
    ).toHaveTextContent("200.00%");
    expect(
      screen.getByLabelText(
        "Payment Percentage of Performance Milestone Amount (%)"
      )
    ).toHaveTextContent("60.00%");
    expect(
      screen.getByLabelText("Maximum Performance Milestone Amount")
    ).toHaveTextContent("$100");
    expect(
      screen.getByLabelText("Actual Performance Milestone Amount")
    ).toHaveTextContent("$200.00");
    expect(
      screen.getByLabelText(/Date invoice sent to CSNR/i)
    ).toHaveTextContent(/Feb[.]? 11, 2022/);
  });

  it("renders 0% for the GHG emissions performance if the calculated value is null", () => {
    const mockResolver = {
      ...defaultMockResolver,
      ProjectRevision(context, generateID) {
        return {
          ...defaultMockResolver.ProjectRevision(context, generateID),
          emissionIntensityReportingRequirementFormChange: {
            edges: [
              {
                node: {
                  ...defaultMockResolver.ProjectRevision(context, generateID),
                  calculatedEiPerformance: null,
                },
              },
            ],
            __id: "client:mock:__connection_emissionIntensityReportFormChange_connection",
          },
        };
      },
    };

    componentTestingHelper.loadQuery(mockResolver);
    componentTestingHelper.renderComponent();

    expect(
      screen.getByText("GHG Emission Intensity Performance").closest("div")
    ).toHaveTextContent(
      "This field cannot be calculated due to lack of information now"
    );
  });

  it("renders the TEIMP form with placeholders for calculated values, when the form is not filled", () => {
    const mockResolver = {
      Form: defaultMockResolver.Form,
      Query: defaultMockResolver.Query,
      ProjectRevision: (context, generateID) => ({
        ...defaultMockResolver.ProjectRevision(context, generateID),
        emissionIntensityReportingRequirementFormChange: {
          edges: [
            {
              node: {
                id: `mock-project-milestone-report-form-${generateID()}`,
                calculatedEiPerformance: null,
                rowId: 1,
                newFormData: {
                  measurementPeriodStartDate: "2022-01-02",
                  measurementPeriodEndDate: "2023-01-02",
                  emissionFunctionalUnit: "tCO2e",
                },
                operation: "CREATE",
                changeStatus: "pending",
                formChangeByPreviousFormChangeId: null,
              },
            },
          ],
          __id: "client:mock:__connection_emissionIntensityReportFormChange_connection",
        },
      }),
    };

    componentTestingHelper.loadQuery(mockResolver);
    componentTestingHelper.renderComponent();
    expect(
      screen.getByText("GHG Emission Intensity Performance").closest("div")
    ).toHaveTextContent(
      "This field cannot be calculated due to lack of information now"
    );
  });

  it("uses useMutationWithErrorMessage and returns expected message when the user clicks the Add button and there's a mutation error", () => {
    const mockResolver = {
      ...defaultMockResolver,
      ProjectRevision(context, generateID) {
        return {
          ...defaultMockResolver.ProjectRevision(context, generateID),

          emissionIntensityReportingRequirementFormChange: {
            edges: [],
            __id: "client:mock:__connection_emissionIntensityReportingRequirementFormChange_connection",
          },
        };
      },
    };
    componentTestingHelper.loadQuery(mockResolver);
    componentTestingHelper.renderComponent();
    expect(
      screen.getByText("Add Emissions Intensity Report")
    ).toBeInTheDocument();
    userEvent.click(screen.getByText("Add Emissions Intensity Report"));
    act(() => {
      componentTestingHelper.environment.mock.rejectMostRecentOperation(
        new Error()
      );
    });
    expect(componentTestingHelper.errorContext.setError).toBeCalledWith(
      "An error occurred while attempting to create the project emissions intensity report."
    );
  });

  it("validates form when the submit button is clicked", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    const validateFormWithErrors = jest.spyOn(
      require("lib/helpers/validateFormWithErrors"),
      "default"
    );
    userEvent.click(screen.getByText(/submit.*/i));
    expect(validateFormWithErrors).toHaveBeenCalledTimes(1);
  });

  it("stages the form changes when the `submit` button is clicked", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    userEvent.click(screen.getByText(/submit.*/i));

    componentTestingHelper.expectMutationToBeCalled(
      "stageReportingRequirementFormChangeMutation",
      {
        input: {
          rowId: 1,
          formChangePatch: expect.any(Object),
        },
        reportType: "TEIMP",
      }
    );
  });

  it("calls the undoFormChangesMutation when the user clicks the Undo Changes button", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    userEvent.click(screen.getByText(/submit.*/i));
    userEvent.type(screen.getAllByLabelText(/comments/i)[0], " edited");

    userEvent.click(screen.getByText(/Undo Changes/i));

    // expect the following operations: form index query, stage, update, undo
    expect(
      componentTestingHelper.environment.mock.getAllOperations()
    ).toHaveLength(4);

    componentTestingHelper.expectMutationToBeCalled("undoFormChangesMutation", {
      input: {
        formChangesIds: [1],
      },
    });
  });

  it("calls the updateformchange mutation when the user types in data", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    userEvent.click(screen.getByText(/submit.*/i));
    userEvent.type(screen.getAllByLabelText(/comments/i)[0], " edited");
    componentTestingHelper.expectMutationToBeCalled(
      "updateEmissionIntensityReportFormChangeMutation",
      {
        input: {
          rowId: 1,
          formChangePatch: expect.any(Object),
        },
      }
    );
  });
  it("shows the correct emission functional unit and production functional unit", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    const emissionFunctionalUnitInput = screen.getByRole("textbox", {
      name: /^functional unit$/i,
    });
    const productionFunctionalUnitInput = screen.getByRole("textbox", {
      name: /^production functional unit$/i,
    });

    expect(screen.getAllByText(/tco2e\/gj/i)).toHaveLength(3);

    expect(emissionFunctionalUnitInput).toHaveValue("tCO2e");
    expect(productionFunctionalUnitInput).toHaveValue("GJ");

    userEvent.clear(emissionFunctionalUnitInput);
    userEvent.type(emissionFunctionalUnitInput, "tCO2");
    userEvent.clear(productionFunctionalUnitInput);
    userEvent.type(productionFunctionalUnitInput, "G");

    expect(screen.getAllByText(/tco2\/g/i)).toHaveLength(3);
  });
  it("can call updateEmissionIntensityReportFormChangeMutation with zero values and decimal points on BEI/TEI/PEI and Total Lifetime Emission Reduction", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    const baselineEmissionIntensityInput = screen.getByLabelText(
      "Baseline Emission Intensity (BEI)"
    );
    const targetEmissionIntensityInput = screen.getByLabelText(
      "Target Emission Intensity (TEI)"
    );

    const postProjectEmissionIntensityInput = screen.getByLabelText(
      "Post-Project Emission Intensity (PEI)"
    );

    const totalLifetimeEmissionReductionsInput = screen.getByLabelText(
      "Total Project Lifetime Emissions Reductions"
    );

    userEvent.clear(baselineEmissionIntensityInput);
    userEvent.type(baselineEmissionIntensityInput, "0");

    userEvent.clear(targetEmissionIntensityInput);
    userEvent.type(targetEmissionIntensityInput, "0.12345678");

    userEvent.clear(postProjectEmissionIntensityInput);
    userEvent.type(postProjectEmissionIntensityInput, "0.123");

    userEvent.clear(totalLifetimeEmissionReductionsInput);
    userEvent.type(totalLifetimeEmissionReductionsInput, "0.000000000");

    componentTestingHelper.expectMutationToBeCalled(
      "updateEmissionIntensityReportFormChangeMutation",
      {
        input: {
          rowId: 1,
          formChangePatch: {
            newFormData: expect.objectContaining({
              baselineEmissionIntensity: 0,
              targetEmissionIntensity: 0.12345678,
              postProjectEmissionIntensity: 0.123,
              totalLifetimeEmissionReduction: 0,
            }),
          },
        },
      }
    );
  });

  it("renders the help tooltips for the Upon Completion form", () => {
    // Note the exclusion of the GHG Emission Intensity Performance (Adjusted) field here
    // This is captured in AdjustableCalculatedValueWidget.test.tsx
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(
      screen.getByRole("tooltip", {
        name: "ghg-emission-intensity-performance-tooltip",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tooltip", {
        name: "payment-percentage-of-performance-milestone-amount-(%)-tooltip",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tooltip", {
        name: "maximum-performance-milestone-amount-tooltip",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tooltip", {
        name: "actual-performance-milestone-amount-tooltip",
      })
    ).toBeInTheDocument();
  });
});
