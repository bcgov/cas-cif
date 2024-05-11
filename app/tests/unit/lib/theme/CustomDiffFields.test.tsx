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
      title: "Score",
      default: undefined,
    },
    moneyTest: {
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
  "ui:order": ["stringTest", "numberTest", "moneyTest", "numericIdTest"],
  stringTest: {
    "bcgov:size": "small",
    "ui:help": <small>(e.g. 2020-RFP-1-ABCD-123)</small>,
  },
  numberTest: {
    "ui:widget": "NumberWidget",
    isMoney: false,
    "ui:col-md": 12,
    "bcgov:size": "small",
  },
  moneyTest: {
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
  moneyTest: 10,
  numericIdTest: 1,
};

const latestCommittedData = {
  stringTest: "stringTest LAST COMMITTED",
  numberTest: 300,
  moneyTest: 30,
  numericIdTest: 3,
};

const latestCommittedUiTestSchema = JSON.parse(JSON.stringify(uiTestSchema));

latestCommittedUiTestSchema.numericIdTest["ui:options"].text =
  "I am the last committed value";

describe("The Object Field Template", () => {

  it("shows diffs when the latest committed value exists and has been changed in the new data", () => {
    const componentUnderTest = render(
      <FormBase
        tagName={"dl"}
        fields={CUSTOM_DIFF_FIELDS}
        schema={testSchema as JSONSchema7}
        uiSchema={uiTestSchema}
        formData={formData}
        formContext={{
          latestCommittedData: latestCommittedData,
          latestCommittedUiSchema: latestCommittedUiTestSchema,
          operation: "UPDATE",
        }}
      />
    );

    expect(componentUnderTest.getByText("stringTest NEW")).toBeInTheDocument();
    expect(componentUnderTest.getByText("stringTest LAST COMMITTED")).toBeInTheDocument();

    expect(componentUnderTest.getByText("100")).toBeInTheDocument();
    expect(componentUnderTest.getByText("300")).toBeInTheDocument();

    expect(componentUnderTest.getByText("$10.00")).toBeInTheDocument();
    expect(componentUnderTest.getByText("$30.00")).toBeInTheDocument();

    expect(
      componentUnderTest.getByText(/I am the last committed value/i)
    ).toBeInTheDocument();
    expect(
      componentUnderTest.getByText("I replaced the ID")
    ).toBeInTheDocument();
  });

  it("shows data has been removed when there is latest committed data but no new data", () => {
    const componentUnderTest = render(
      <FormBase
        tagName={"dl"}
        fields={CUSTOM_DIFF_FIELDS}
        schema={testSchema as JSONSchema7}
        uiSchema={uiTestSchema}
        formData={null}
        formContext={{
          operation: "CREATE",
          latestCommittedData,
          latestCommittedUiSchema: latestCommittedUiTestSchema
        }}
      />
    );
    expect(componentUnderTest.getByText("stringTest LAST COMMITTED")).toHaveClass(
      "diffOld"
    );
    expect(componentUnderTest.getByText("$30.00")).toHaveClass("diffOld");
    expect(componentUnderTest.getByText("I am the last committed value")).toHaveClass(
      "diffOld"
    );
  });

  it("shows data has been added when there is newData, and there is no latest committed", () => {
    const componentUnderTest = render(
      <FormBase
        tagName={"dl"}
        fields={CUSTOM_DIFF_FIELDS}
        schema={testSchema as JSONSchema7}
        uiSchema={uiTestSchema}
        formData={formData}
        formContext={{
          latestCommittedUiSchema: latestCommittedUiTestSchema,
          operation: "CREATE",
        }}
      />
    );

    expect(componentUnderTest.getByText("stringTest NEW")).toHaveClass(
      "diffNew"
    );
    expect(componentUnderTest.getByText("$10.00")).toHaveClass("diffNew");
    expect(componentUnderTest.getByText("I replaced the ID")).toHaveClass(
      "diffNew"
    );
  });
  // 011
  it("shows data has been added when there is newData, and latest committed data", () => {
    const componentUnderTest = render(
      <FormBase
        tagName={"dl"}
        fields={CUSTOM_DIFF_FIELDS}
        schema={testSchema as JSONSchema7}
        uiSchema={uiTestSchema}
        formData={formData}
        formContext={{
          operation: "CREATE",
          latestCommittedData,
        }}
      />
    );

    expect(componentUnderTest.getByText("stringTest NEW")).toHaveClass(
      "diffNew"
    );
    expect(
      componentUnderTest.getByText("stringTest LAST COMMITTED")
    ).toHaveClass("diffOld");
    expect(componentUnderTest.getByText("100")).toHaveClass("diffNew");
    expect(componentUnderTest.getByText("300")).toHaveClass("diffOld");
  });

  // numericId test
  it("shows the text from 'ui:options' when 'ui:options' exists in a NumberField's uiSchema", () => {
    const componentUnderTest = render(
      <FormBase
        tagName={"dl"}
        fields={CUSTOM_DIFF_FIELDS}
        schema={testSchema as JSONSchema7}
        uiSchema={uiTestSchema}
        formData={formData}
        formContext={{
          latestCommittedData,
          latestCommittedUiSchema: latestCommittedUiTestSchema,
          operation: "UPDATE",
        }}
      />
    );
    expect(
      componentUnderTest.getByText("I replaced the ID")
    ).toBeInTheDocument();
    expect(componentUnderTest.queryByText("1")).not.toBeInTheDocument();
  });

  // number specific tests
  it("shows the number with a preceding $ when uiSchema.isMoney is true in a NumberField's uiSchema", () => {
    const componentUnderTest = render(
      <FormBase
        tagName={"dl"}
        fields={CUSTOM_DIFF_FIELDS}
        schema={testSchema as JSONSchema7}
        uiSchema={uiTestSchema}
        formData={formData}
        formContext={{
          latestCommittedData: latestCommittedData,
          operation: "UPDATE",
        }}
      />
    );
    expect(componentUnderTest.getByText("$10.00")).toBeInTheDocument();
  });

  it("shows the number without a preceding $ when uiSchema.isMoney is false in a NumberField's uiSchema", () => {
    const componentUnderTest = render(
      <FormBase
        tagName={"dl"}
        fields={CUSTOM_DIFF_FIELDS}
        schema={testSchema as JSONSchema7}
        uiSchema={uiTestSchema}
        formData={formData}
        formContext={{
          latestCommittedData,
          latestCommittedUiSchema: latestCommittedUiTestSchema,
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
          latestCommittedData,
          latestCommittedUiSchema: latestCommittedUiTestSchema,
          operation: "UPDATE",
          isAmendmentsAndOtherRevisionsSpecific: true,
        }}
      />
    );

    expect(componentUnderTest.getByText("stringTest NEW")).toHaveClass(
      "diffNew"
    );
    expect(componentUnderTest.getByText("stringTest LAST COMMITTED")).toHaveClass(
      "diffOld"
    );
  });

  it("handles 0 when latest committed data is 0", () => {
    const latestCommittedDataWithZero = {
      stringTest: "stringTest LAST COMMITTED",
      numberTest: 0,
      numericIdTest: 0,
    };
    const componentUnderTest = render(
      <FormBase
        tagName={"dl"}
        fields={CUSTOM_DIFF_FIELDS}
        schema={testSchema as JSONSchema7}
        uiSchema={uiTestSchema}
        formData={formData}
        formContext={{
          operation: "UPDATE",
          isAmendmentsAndOtherRevisionsSpecific: true,
          latestCommittedData: latestCommittedDataWithZero,
        }}
      />
    );
    expect(componentUnderTest.getByText("0")).toHaveClass("diffOld");
  });

  it("handles 0 when new formdata is 0", () => {
    const formDataWithZero = {
      stringTest: "",
      numberTest: 0,
      numericIdTest: 0,
    };
    const componentUnderTest = render(
      <FormBase
        tagName={"dl"}
        fields={CUSTOM_DIFF_FIELDS}
        schema={testSchema as JSONSchema7}
        uiSchema={uiTestSchema}
        formData={formDataWithZero}
        formContext={{
          operation: "UPDATE",
          isAmendmentsAndOtherRevisionsSpecific: true,
          latestCommittedData,
        }}
      />
    );
    expect(componentUnderTest.getByText("0")).toHaveClass("diffNew");
  });
});
