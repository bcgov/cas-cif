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
  // 111
  it("shows diffs when there is an old, new, and latest committed value, and old !== latest committed", () => {
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

  it("shows diffs when there is an old, new, and latest committed value and old === latest committed", () => {
    const componentUnderTest = render(
      <FormBase
        tagName={"dl"}
        fields={CUSTOM_DIFF_FIELDS}
        schema={testSchema as JSONSchema7}
        uiSchema={uiTestSchema}
        formData={formData}
        formContext={{
          oldData: oldFormData,
          latestCommittedData: oldFormData,
          oldUiSchema: oldUiTestSchema,
          latestCommittedUiSchema: oldUiTestSchema,
          operation: "UPDATE",
        }}
      />
    );

    expect(componentUnderTest.getByText("stringTest NEW")).toBeInTheDocument();
    expect(componentUnderTest.getByText("stringTest OLD")).toBeInTheDocument();
    expect(
      componentUnderTest.queryByText(/^(.*?)LAST COMMITTED/)
    ).not.toBeInTheDocument();
    expect(componentUnderTest.getByText("$100.00")).toBeInTheDocument();
    expect(componentUnderTest.getByText("$200.00")).toBeInTheDocument();
    expect(componentUnderTest.queryByText("$300.00")).not.toBeInTheDocument();
    expect(
      componentUnderTest.getByText("I replaced the ID")
    ).toBeInTheDocument();
    expect(
      componentUnderTest.getByText("I replaced the OLD ID")
    ).toBeInTheDocument();
    expect(
      componentUnderTest.queryByText(/I am the last committed value/i)
    ).not.toBeInTheDocument();
  });
  // 101
  it("shows data has been removed when there is old data and latest committed data but no new data", () => {
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
          latestCommittedData,
        }}
      />
    );
    expect(componentUnderTest.getByText("stringTest OLD")).toHaveClass(
      "diffOld"
    );
    expect(componentUnderTest.getByText("$200.00")).toHaveClass("diffOld");
    expect(componentUnderTest.getByText("I replaced the OLD ID")).toHaveClass(
      "diffOld"
    );
  });

  // 010
  it("shows data has been added when there is newData, and there is no old data or no latest committed", () => {
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

    expect(componentUnderTest.getByText("stringTest NEW")).toHaveClass(
      "diffNew"
    );
    expect(componentUnderTest.getByText("$100.00")).toHaveClass("diffNew");
    expect(componentUnderTest.getByText("I replaced the ID")).toHaveClass(
      "diffNew"
    );
  });
  // 011
  it("shows data has been added when there is newData, latest and there is no old data", () => {
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
          latestCommittedData: latestCommittedData,
        }}
      />
    );

    expect(componentUnderTest.getByText("stringTest NEW")).toHaveClass(
      "diffNew"
    );
    expect(
      componentUnderTest.getByText("stringTest LAST COMMITTED")
    ).toHaveClass("diffOld");
    expect(componentUnderTest.getByText("$100.00")).toHaveClass("diffNew");
    expect(componentUnderTest.getByText("$300.00")).toHaveClass("diffOld");
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
      "diffNew"
    );
    expect(componentUnderTest.getByText("stringTest OLD")).toHaveClass(
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
          oldData: oldFormData,
          oldUiSchema: oldUiTestSchema,
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
          oldData: oldFormData,
          oldUiSchema: oldUiTestSchema,
          operation: "UPDATE",
          isAmendmentsAndOtherRevisionsSpecific: true,
          latestCommittedData,
        }}
      />
    );
    expect(componentUnderTest.getByText("0")).toHaveClass("diffNew");
  });
  it("handles 0 when latestCommittedData and oldData are 0, (the same), and newFormData exists", () => {
    const latestCommittedDataWithZero = {
      stringTest: "stringTest LAST COMMITTED",
      numberTest: 0,
    };

    const oldDataWithZero = {
      stringTest: "stringTest FORM DATA",
      numberTest: 0,
    };

    const componentUnderTest = render(
      <FormBase
        tagName={"dl"}
        fields={CUSTOM_DIFF_FIELDS}
        schema={testSchema as JSONSchema7}
        uiSchema={uiTestSchema}
        formData={formData}
        formContext={{
          oldData: oldDataWithZero,
          oldUiSchema: oldUiTestSchema,
          operation: "UPDATE",
          isAmendmentsAndOtherRevisionsSpecific: true,
          latestCommittedData: latestCommittedDataWithZero,
        }}
      />
    );
    expect(componentUnderTest.getAllByText("0")[0]).toHaveClass("diffOld");
    expect(componentUnderTest.getAllByText("0")).toHaveLength(1);
    expect(componentUnderTest.getByText("100")).toHaveClass("diffNew");
  });
  it("handles 0 when oldData is 0", () => {
    const oldDataWithZero = {
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
        formData={formData}
        formContext={{
          oldData: oldDataWithZero,
          oldUiSchema: oldUiTestSchema,
          operation: "UPDATE",
          isAmendmentsAndOtherRevisionsSpecific: true,
          latestCommittedData,
        }}
      />
    );

    expect(componentUnderTest.getAllByText("0")[0]).toHaveClass("diffOld");
    expect(componentUnderTest.getAllByText("0")).toHaveLength(1);
  });

  it("handles 0 when oldData and latest data is 0", () => {
    const oldDataWithZero = {
      stringTest: "",
      numberTest: 0,
      numericIdTest: 0,
    };
    const latestCommittedDataWithZero = {
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
        formData={formData}
        formContext={{
          oldData: oldDataWithZero,
          oldUiSchema: oldUiTestSchema,
          operation: "UPDATE",
          isAmendmentsAndOtherRevisionsSpecific: true,
          latestCommittedData: latestCommittedDataWithZero,
        }}
      />
    );

    expect(componentUnderTest.getAllByText("0")[0]).toHaveClass("diffOld");
    expect(componentUnderTest.getAllByText("0")).toHaveLength(1);
  });
  it("handles 0 when newData and latest data is 0", () => {
    const formDataWithZero = {
      stringTest: "",
      numberTest: 0,
      numericIdTest: 0,
    };
    const latestCommittedDataWithZero = {
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
          oldData: oldFormData,
          oldUiSchema: oldUiTestSchema,
          operation: "UPDATE",
          isAmendmentsAndOtherRevisionsSpecific: true,
          latestCommittedData: latestCommittedDataWithZero,
        }}
      />
    );

    expect(componentUnderTest.getAllByText("0")[0]).toHaveClass("diffOld");
    expect(componentUnderTest.getAllByText("0")[1]).toHaveClass("diffNew");
    expect(componentUnderTest.getAllByText("0")).toHaveLength(2);
  });
  // 111
  it("handles 0 when latestCommittedData,oldData formData are all 0", () => {
    const latestCommittedDataWithZero = {
      stringTest: "stringTest LAST COMMITTED",
      numberTest: 0,
      numericIdTest: 0,
    };

    const formDataWithZero = {
      stringTest: "stringTest FORM DATA",
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
          oldData: oldFormData,
          oldUiSchema: oldUiTestSchema,
          operation: "UPDATE",
          isAmendmentsAndOtherRevisionsSpecific: true,
          latestCommittedData: latestCommittedDataWithZero,
        }}
      />
    );

    expect(componentUnderTest.getAllByText("0")[0]).toHaveClass("diffOld");
    expect(componentUnderTest.getAllByText("0")[1]).toHaveClass("diffNew");
    expect(componentUnderTest.getAllByText("0")).toHaveLength(2);
  });
});
