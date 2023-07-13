import { screen } from "@testing-library/react";
import AnticipatedFundingAmountPerFiscalYearArrayFieldTemplate from "components/Form/AnticipatedFundingAmountByFiscalYearArrayFieldTemplate";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledAnticipatedFundingAmountPerFiscalYearArrayFieldTemplateTestQuery, {
  AnticipatedFundingAmountPerFiscalYearArrayFieldTemplateTestQuery,
} from "__generated__/AnticipatedFundingAmountPerFiscalYearArrayFieldTemplateTestQuery.graphql";

const testQuery = graphql`
  query AnticipatedFundingAmountPerFiscalYearArrayFieldTemplateTestQuery
  @relay_test_operation {
    query {
      formChange(id: "test") {
        ...AnticipatedFundingAmountByFiscalYearArrayFieldTemplate_formChange
      }
    }
  }
`;

const mockQueryPayload = {
  FormChange() {
    const result = {
      anticipatedFundingAmountPerFiscalYear: {
        edges: [
          {
            node: {
              anticipatedFundingAmount: "20082009.00",
              fiscalYear: "2008/2009",
            },
          },
          {
            node: {
              anticipatedFundingAmount: "20212022.00",
              fiscalYear: "2021/2022",
            },
          },
          {
            node: {
              anticipatedFundingAmount: "20222023.00",
              fiscalYear: "2022/2023",
            },
          },
          {
            node: {
              anticipatedFundingAmount: "20372038.00",
              fiscalYear: "2037/2038",
            },
          },
        ],
      },
    };
    return result;
  },
};

const componentTestingHelper =
  new ComponentTestingHelper<AnticipatedFundingAmountPerFiscalYearArrayFieldTemplateTestQuery>(
    {
      component: AnticipatedFundingAmountPerFiscalYearArrayFieldTemplate,
      testQuery: testQuery,
      compiledQuery:
        compiledAnticipatedFundingAmountPerFiscalYearArrayFieldTemplateTestQuery,
      getPropsFromTestQuery: (data) => ({
        query: data.query,
        formContext: {
          formChange: data.query.formChange,
        },
      }),
      defaultQueryResolver: mockQueryPayload,
      defaultQueryVariables: {},
      defaultComponentProps: { idSchema: { $id: null } },
    }
  );

describe("The AnticipatedFundingAmountPerFiscalYearWidget", () => {
  beforeEach(() => {
    componentTestingHelper.reinit();
  });
  it("when four years' worth of data is available, renders anticipated values for four fiscal years and renders fiscal year dates in labels", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    expect(
      screen.getByLabelText<HTMLLabelElement>(
        /Anticipated Funding Amount Per Fiscal Year 1 \(2008\/2009\)/i
      )
    ).toHaveTextContent("$20,082,009.00");
    expect(
      screen.getByLabelText<HTMLLabelElement>(
        /Anticipated Funding Amount Per Fiscal Year 2 \(2021\/2022\)/i
      )
    ).toHaveTextContent("$20,212,022.00");
    expect(
      screen.getByLabelText<HTMLLabelElement>(
        /Anticipated Funding Amount Per Fiscal Year 3 \(2022\/2023\)/i
      )
    ).toHaveTextContent("$20,222,023.00");
    expect(
      screen.getByLabelText<HTMLLabelElement>(
        /Anticipated Funding Amount Per Fiscal Year 4 \(2037\/2038\)/i
      )
    ).toHaveTextContent("$20,372,038.00");
  });

  it("when two years' worth of data is available, renders anticipated values for two years and renders fiscal year dates in labels, and renders a message with a shortened label", () => {
    componentTestingHelper.loadQuery({
      FormChange() {
        const result = {
          anticipatedFundingAmountPerFiscalYear: {
            edges: [
              {
                node: {
                  anticipatedFundingAmount: "20082009.00",
                  fiscalYear: "2008/2009",
                },
              },
              {
                node: {
                  anticipatedFundingAmount: "20212022.00",
                  fiscalYear: "2021/2022",
                },
              },
            ],
          },
        };
        return result;
      },
    });
    componentTestingHelper.renderComponent();

    expect(
      screen.getByLabelText<HTMLLabelElement>(
        /Anticipated Funding Amount Per Fiscal Year 1 \(2008\/2009\)/i
      )
    ).toHaveTextContent("$20,082,009.00");
    expect(
      screen.getByLabelText<HTMLLabelElement>(
        /Anticipated Funding Amount Per Fiscal Year 2 \(2021\/2022\)/i
      )
    ).toHaveTextContent("$20,212,022.00");
    expect(
      screen.getByText(/Anticipated Funding Amount Per Fiscal Year 3/i)
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(
        /This field cannot be calculated due to lack of information now./i
      )
    ).toHaveLength(1);
  });

  it("when no data is available, renders anticipated values for three fiscal years and shortened labels", () => {
    componentTestingHelper.loadQuery({
      FormChange() {
        const result = {
          anticipatedFundingAmountPerFiscalYear: {
            edges: [],
          },
        };
        return result;
      },
    });
    componentTestingHelper.renderComponent();
    expect(
      screen.getByText(/Anticipated Funding Amount Per Fiscal Year 1/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Anticipated Funding Amount Per Fiscal Year 2/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Anticipated Funding Amount Per Fiscal Year 3/i)
    ).toBeInTheDocument();

    expect(
      screen.getAllByText(
        /This field cannot be calculated due to lack of information now./i
      )
    ).toHaveLength(3);
  });
});
