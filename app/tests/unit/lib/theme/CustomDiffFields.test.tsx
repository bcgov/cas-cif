import { render } from "@testing-library/react";
import CUSTOM_DIFF_FIELDS from "lib/theme/CustomDiffFields";
import React from "react";
import type { JSONSchema7 } from "json-schema";
import FormBase from "components/Form/FormBase";

const testSchema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  properties: {
    stringTest: {
      type: "string",
      title: "Proposal Reference",
    },
    numberTest: {
      type: "number",
      title: "Total Funding Request",
      default: undefined,
    },
    numericIdTest: {
      type: "number",
      title: "Legal Operator Name and BC Registry ID",
      default: undefined,
      anyOf: undefined,
    },
  },
};

const uiTestSchema = {
  "ui:order": ["stringTest", "numberTest", "numericIdTest"],
  stringTest: {
    "bcgov:size": "small",
    "ui:help": <small>(e.g. 2020-RFP-1-ABCD-123)</small>,
  },
  numberTest: {
    "ui:widget": "NumberWidget",
    isMoney: true,
    "ui:col-md": 12,
    "bcgov:size": "small",
  },
  numericIdTest: {
    "ui:placeholder": "Select an Operator",
    "ui:col-md": 12,
    "bcgov:size": "small",
    "ui:widget": "SearchWidget",
    "ui:options": {
      text: "I replaced the ID",
    },
  },
};

const formData = {
  stringTest: "stringTest NEW",
  numberTest: 100,
  numericIdTest: 1,
};

const oldFormData = {
  stringTest: "stringTest OLD",
  numberTest: 200,
  numericIdTest: 2,
};

const oldUiTestSchema = JSON.parse(JSON.stringify(uiTestSchema));

oldUiTestSchema.numericIdTest["ui:options"].text = "I replaced the OLD ID";

const latestCommittedUiTestSchema = JSON.parse(JSON.stringify(uiTestSchema));

latestCommittedUiTestSchema.numericIdTest["ui:options"].text =
  "I am the last committed value";

const latestCommittedData = {
  stringTest: "stringTest LAST COMMITTED",
  numberTest: 300,
  numericIdTest: 3,
};

describe("The Object Field Template", () => {
  it("shows the latest committed value", () => {
    const componentUnderTest = render(
      <FormBase
        tagName={"dl"}
        fields={CUSTOM_DIFF_FIELDS}
        schema={testSchema as JSONSchema7}
        uiSchema={uiTestSchema}
        formData={formData}
        formContext={{
          oldData: oldFormData,
          latestCommittedData,
          oldUiSchema: oldUiTestSchema,
          latestCommittedUiSchema: latestCommittedUiTestSchema,
          operation: "UPDATE",
        }}
      />
    );

    expect(
      componentUnderTest.getAllByText(/Latest committed value:/i)
    ).toHaveLength(3);
    expect(componentUnderTest.getByText("stringTest NEW")).toBeInTheDocument();
    expect(componentUnderTest.getByText("stringTest OLD")).toBeInTheDocument();
    expect(
      componentUnderTest.getByText(/^(.*?)stringTest LAST COMMITTED/)
    ).toBeInTheDocument();
    expect(componentUnderTest.getByText("$100.00")).toBeInTheDocument();
    expect(componentUnderTest.getByText("$200.00")).toBeInTheDocument();
    expect(componentUnderTest.getByText("$300.00")).toBeInTheDocument();
    expect(
      componentUnderTest.getByText("I replaced the ID")
    ).toBeInTheDocument();
    expect(
      componentUnderTest.getByText("I replaced the OLD ID")
    ).toBeInTheDocument();
    expect(
      componentUnderTest.getByText(/I am the last committed value/i)
    ).toBeInTheDocument();
  });

  it("shows a diff when there is oldData, newData & the operation is 'UPDATE'", () => {
    const componentUnderTest = render(
      <FormBase
        tagName={"dl"}
        fields={CUSTOM_DIFF_FIELDS}
        schema={testSchema as JSONSchema7}
        uiSchema={uiTestSchema}
        formData={formData}
        formContext={{
          oldData: oldFormData,
          oldUiSchema: oldUiTestSchema,
          operation: "UPDATE",
        }}
      />
    );

    expect(componentUnderTest.getByText("stringTest NEW")).toBeInTheDocument();
    expect(componentUnderTest.getByText("stringTest OLD")).toBeInTheDocument();
    expect(componentUnderTest.getByText("$100.00")).toBeInTheDocument();
    expect(componentUnderTest.getByText("$200.00")).toBeInTheDocument();
    expect(
      componentUnderTest.getByText("I replaced the ID")
    ).toBeInTheDocument();
    expect(
      componentUnderTest.getByText("I replaced the OLD ID")
    ).toBeInTheDocument();
  });

  it("shows data has been added when there is newData, the operation is 'CREATE' & there is no old data", () => {
    const componentUnderTest = render(
      <FormBase
        tagName={"dl"}
        fields={CUSTOM_DIFF_FIELDS}
        schema={testSchema as JSONSchema7}
        uiSchema={uiTestSchema}
        formData={formData}
        formContext={{
          oldData: null,
          oldUiSchema: oldUiTestSchema,
          operation: "CREATE",
        }}
      />
    );

    expect(componentUnderTest.getByText("stringTest NEW")).toBeInTheDocument();
    expect(componentUnderTest.getByText("$100.00")).toBeInTheDocument();
    expect(
      componentUnderTest.getByText("I replaced the ID")
    ).toBeInTheDocument();
    expect(componentUnderTest.getAllByText("ADDED")).toHaveLength(3);
  });

  it("shows data has been removed when there is old data and no new data", () => {
    const componentUnderTest = render(
      <FormBase
        tagName={"dl"}
        fields={CUSTOM_DIFF_FIELDS}
        schema={testSchema as JSONSchema7}
        uiSchema={uiTestSchema}
        formData={null}
        formContext={{
          oldData: oldFormData,
          oldUiSchema: oldUiTestSchema,
          operation: "CREATE",
        }}
      />
    );

    expect(componentUnderTest.getByText("stringTest OLD")).toBeInTheDocument();
    expect(componentUnderTest.getByText("$200.00")).toBeInTheDocument();
    expect(
      componentUnderTest.getByText("I replaced the OLD ID")
    ).toBeInTheDocument();
    expect(componentUnderTest.getAllByText("REMOVED")).toHaveLength(3);
  });

  it("shows data has been removed when operation is 'ARCHIVE'", () => {
    const componentUnderTest = render(
      <FormBase
        tagName={"dl"}
        fields={CUSTOM_DIFF_FIELDS}
        schema={testSchema as JSONSchema7}
        uiSchema={uiTestSchema}
        formData={formData}
        formContext={{
          oldData: oldFormData,
          oldUiSchema: oldUiTestSchema,
          operation: "ARCHIVE",
        }}
      />
    );

    expect(componentUnderTest.getByText("stringTest OLD")).toBeInTheDocument();
    expect(componentUnderTest.getByText("$200.00")).toBeInTheDocument();
    expect(
      componentUnderTest.getByText("I replaced the OLD ID")
    ).toBeInTheDocument();
    expect(componentUnderTest.getAllByText("REMOVED")).toHaveLength(3);
  });

  it("shows the text from 'ui:options' when 'ui:options' exists in a NumberField's uiSchema", () => {
    const componentUnderTest = render(
      <FormBase
        tagName={"dl"}
        fields={CUSTOM_DIFF_FIELDS}
        schema={testSchema as JSONSchema7}
        uiSchema={uiTestSchema}
        formData={formData}
        formContext={{
          oldData: oldFormData,
          oldUiSchema: oldUiTestSchema,
          operation: "UPDATE",
        }}
      />
    );
    expect(
      componentUnderTest.getByText("I replaced the ID")
    ).toBeInTheDocument();
    expect(componentUnderTest.queryByText("1")).not.toBeInTheDocument();
  });

  it("shows the number with a preceding $ when uiSchema.isMoney is true in a NumberField's uiSchema", () => {
    const componentUnderTest = render(
      <FormBase
        tagName={"dl"}
        fields={CUSTOM_DIFF_FIELDS}
        schema={testSchema as JSONSchema7}
        uiSchema={uiTestSchema}
        formData={formData}
        formContext={{
          oldData: oldFormData,
          oldUiSchema: oldUiTestSchema,
          operation: "UPDATE",
        }}
      />
    );
    expect(componentUnderTest.getByText("$100.00")).toBeInTheDocument();
  });

  it("shows the number without a preceding $ when uiSchema.isMoney is false in a NumberField's uiSchema", () => {
    delete uiTestSchema.numberTest.isMoney;

    const componentUnderTest = render(
      <FormBase
        tagName={"dl"}
        fields={CUSTOM_DIFF_FIELDS}
        schema={testSchema as JSONSchema7}
        uiSchema={uiTestSchema}
        formData={formData}
        formContext={{
          oldData: oldFormData,
          oldUiSchema: oldUiTestSchema,
          operation: "UPDATE",
        }}
      />
    );
    expect(componentUnderTest.getByText("100")).toBeInTheDocument();
    expect(componentUnderTest.queryByText("$100.00")).not.toBeInTheDocument();
  });

  it("shows form has been added when there is no formData, the operation is 'CREATE' & there is no old data", () => {
    delete uiTestSchema.numberTest["ui:widget"];

    const componentUnderTest = render(
      <FormBase
        tagName={"dl"}
        fields={CUSTOM_DIFF_FIELDS}
        schema={testSchema as JSONSchema7}
        uiSchema={uiTestSchema}
        formData={null}
        formContext={{
          oldData: null,
          oldUiSchema: null,
          operation: "CREATE",
        }}
      />
    );
    expect(
      componentUnderTest.getByText("I replaced the ID")
    ).toBeInTheDocument();
  });
  it("shows updated forms widget specific styles", () => {
    const componentUnderTest = render(
      <FormBase
        tagName={"dl"}
        fields={CUSTOM_DIFF_FIELDS}
        schema={testSchema as JSONSchema7}
        uiSchema={uiTestSchema}
        formData={formData}
        formContext={{
          oldData: oldFormData,
          oldUiSchema: oldUiTestSchema,
          operation: "UPDATE",
          isAmendmentsAndOtherRevisionsSpecific: true,
        }}
      />
    );

    expect(componentUnderTest.getByText("stringTest NEW")).toHaveClass(
      "diffAmendmentsAndOtherRevisionsNew"
    );
    expect(componentUnderTest.getByText("stringTest OLD")).toHaveClass(
      "diffAmendmentsAndOtherRevisionsOld"
    );
  });
});
