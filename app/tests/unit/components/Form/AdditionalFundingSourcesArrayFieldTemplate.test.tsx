import { render, screen } from "@testing-library/react";
import AdditionalFundingSourcesArrayFieldTemplate from "components/Form/AdditionalFundingSourcesArrayFieldTemplate";
import FormBase from "components/Form/FormBase";
import { JSONSchema7 } from "json-schema";

import epSchema from "/schema/data/prod/json_schema/funding_parameter_EP.json";
import iaSchema from "/schema/data/prod/json_schema/funding_parameter_IA.json";

const mockProps = {
  DescriptionField: () => <div></div>,
  TitleField: () => <div></div>,
  items: [],
  canAdd: true,
  className: "field field-array field-array-of-object",
  disabled: false,
  formData: [],
  idSchema: {
    $id: "ProjectFundingAgreementForm_additionalFundingSources",
  },
  onAddClick: () => {},
  readonly: false,
  registry: {
    fields: {},
    widgets: {},
    rootSchema: {},
    definitions: {},
    formContext: {},
  },
  required: false,
  schema: epSchema.schema,
  title: "Additional Funding Sources",
  formContext: {},
  uiSchema: {},
};

describe("AdditionalFundingSourcesArrayFieldTemplate", () => {
  it("Displays only an Add button when there are no additional funding sources", () => {
    render(<AdditionalFundingSourcesArrayFieldTemplate {...mockProps} />);
    expect(
      screen.getByRole("button", { name: /add funding source/i })
    ).toBeVisible();
    expect(screen.queryByRole("button", { name: /remove/i })).toBeNull();
  });

  it("Displays a form and a remove button for every item, and displays an Add button", () => {
    const updatedProps = {
      ...mockProps,
      schema: iaSchema.schema as JSONSchema7,
      formData: {
        additionalFundingSources: [
          { source: "a", amount: 5, status: "Approved" },
          { source: "b", amount: 5, status: "Approved" },
        ],
      },
    };
    render(<AdditionalFundingSourcesArrayFieldTemplate {...updatedProps} />);
    expect(screen.getByText(/additional funding source 1/i)).toBeVisible();
    expect(screen.getByText(/additional funding source 2/i)).toBeVisible();
    expect(screen.getAllByRole("button", { name: /remove/i })).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: /add funding source/i })
    ).toBeVisible();
  });
});
