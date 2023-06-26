import { render, screen } from "@testing-library/react";
import AnticipatedFundingAmountPerFiscalYearArrayFieldTemplate from "components/Form/AnticipatedFundingAmountByFiscalYearArrayFieldTemplate";
import FormBase from "components/Form/FormBase";
import { JSONSchema7 } from "json-schema";

const schema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",

  properties: {
    anticipatedFundingAmountPerFiscalYear: {
      title: "Anticipated Funding Amount Per Fiscal Year",
      minItems: 0,
      type: "array",
      items: {
        $ref: "#/definitions/anticipatedFundingAmount",
      },
    },
  },
  definitions: {
    anticipatedFundingAmount: {
      type: "object",
      required: ["fiscalYear", "anticipatedFundingAmount"],
      properties: {
        fiscalYear: {
          title: "Fiscal Year",
          type: "string",
        },
        anticipatedFundingAmount: {
          title: "Anticipated Funding Amount Per Year",
          type: "number",
        },
      },
    },
  },
};

const uiSchema = {
  anticipatedFundingAmountPerFiscalYear: {
    "ui:ArrayFieldTemplate":
      AnticipatedFundingAmountPerFiscalYearArrayFieldTemplate,
    itemTitle: "Anticipated Funding Amount Per Fiscal Year",
    "ui:order": ["fiscalyear", "anticipatedFundingAmount"],
    items: {
      fiscalYear: {
        "ui:widget": "TextWidget",
      },
      anticipatedFundingAmount: {
        "ui:title": `Anticipated Amount Per Fiscal Year`,
        "ui:widget": "NumberWidget",
        isMoney: true,
      },
    },
  },
};

describe("The AnticipatedFundingAmountPerFiscalYearWidget", () => {
  it("when four years' worth of data is available, renders anticipated values for four fiscal years and renders fiscal year dates in labels", () => {
    render(
      <FormBase
        schema={schema as JSONSchema7}
        uiSchema={uiSchema}
        formContext={{
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
        }}
      />
    );
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
    render(
      <FormBase
        schema={schema as JSONSchema7}
        uiSchema={uiSchema}
        formContext={{
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
        }}
      />
    );

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
    render(
      <FormBase
        schema={schema as JSONSchema7}
        uiSchema={uiSchema}
        formContext={{ anticipatedFundingAmountPerFiscalYear: { edges: [] } }}
      />
    );
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
