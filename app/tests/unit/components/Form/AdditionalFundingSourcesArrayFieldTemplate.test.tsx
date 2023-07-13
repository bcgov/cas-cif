import { render, screen } from "@testing-library/react";
import AdditionalFundingSourcesArrayFieldTemplate from "components/Form/AdditionalFundingSourcesArrayFieldTemplate";
import FormBase from "components/Form/FormBase";
import { JSONSchema7 } from "json-schema";

const schema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  properties: {
    additionalFundingSources: {
      title: "Additional Funding Sources",
      minItems: 0,
      type: "array",
      items: {
        $ref: "#/definitions/additionalFundingSource",
      },
    },
  },
  definitions: {
    additionalFundingSource: {
      type: "object",
      required: ["source", "amount", "status"],
      properties: {
        source: {
          title: "Additional Funding Source",
          type: "string",
        },
        amount: {
          title: "Additional Funding Amount",
          type: "number",
        },
        status: {
          title: "Additional Funding Status",
          type: "string",
        },
      },
    },
  },
};

const fundingParameterEPUiSchema = {
  additionalFundingSources: {
    itemTitle: "Additional Funding Source",
    "ui:ArrayFieldTemplate": AdditionalFundingSourcesArrayFieldTemplate,
    items: {
      "ui:order": ["source", "amount", "status"],
      source: {
        "ui:widget": "TextWidget",
      },
      amount: {
        "ui:title": `Additional Funding Amount`,
        "ui:widget": "NumberWidget",
        isMoney: true,
      },
      status: {
        "ui:title": `Additional Funding Status`,
        "ui:widget": "SearchWidget",
      },
    },
  },
};

describe("AdditionalFundingSourcesArrayFieldTemplate", () => {
  it("Displays only an Add button when there are no additional funding sources", () => {
    // cannot render the ArrayFieldComponent directly because rjsf does some behind-the-scenes work to map the items, and outside of a form the following error occurs: Objects are not valid as a React child
    render(
      <FormBase
        schema={schema as JSONSchema7}
        uiSchema={fundingParameterEPUiSchema}
      />
    );
    expect(
      screen.getByRole("button", { name: /add funding source/i })
    ).toBeVisible();
    expect(screen.queryByRole("button", { name: /remove/i })).toBeNull();
  });

  it("Displays a form and a remove button for every item, and displays an Add button", () => {
    render(
      <FormBase
        schema={schema as JSONSchema7}
        uiSchema={fundingParameterEPUiSchema}
        formData={{
          additionalFundingSources: [
            { source: "a", amount: 5, status: "Approved" },
            { source: "b", amount: 5, status: "Approved" },
          ],
        }}
      />
    );
    expect(screen.getByText(/additional funding source 1/i)).toBeVisible();
    expect(screen.getByText(/additional funding source 2/i)).toBeVisible();
    expect(screen.getAllByRole("button", { name: /remove/i })).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: /add funding source/i })
    ).toBeVisible();
  });
});
