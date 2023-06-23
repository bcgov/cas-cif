import { render, screen } from "@testing-library/react";
import ReadOnlyArrayFieldTemplate from "components/Form/ReadOnlyArrayFieldTemplate";
import FormBase from "components/Form/FormBase";
import { JSONSchema7 } from "json-schema";

import epSchema from "/schema/data/prod/json_schema/funding_parameter_EP.json";
import iaSchema from "/schema/data/prod/json_schema/funding_parameter_IA.json";

describe("ReadOnlyArrayFieldTemplate", () => {
  it("Displays only an Add button when there are no additional funding sources", () => {
    // cannot render the ArrayFieldComponent directly because rjsf does some behind-the-scenes work to map the items, and outside of a form the following error occurs: Objects are not valid as a React child
    render(
      <FormBase
        schema={epSchema.schema as JSONSchema7}
        ArrayFieldTemplate={ReadOnlyArrayFieldTemplate}
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
        schema={iaSchema.schema as JSONSchema7}
        ArrayFieldTemplate={ReadOnlyArrayFieldTemplate}
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
