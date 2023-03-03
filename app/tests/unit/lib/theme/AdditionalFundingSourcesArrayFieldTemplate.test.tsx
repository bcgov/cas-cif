import { render, screen } from "@testing-library/react";
import { fundingParameterEPUiSchema } from "data/jsonSchemaForm/fundingParameterEPUiSchema";
import { JSONSchema7 } from "json-schema";
import AdditionalFundingSourcesArrayFieldTemplate from "lib/theme/AdditionalFundingSourcesArrayFieldTemplate";
import schema from "../../../../../schema/data/prod/json_schema/funding_parameter_EP.json";

describe("AdditionalFundingSourcesArrayFieldTemplate", () => {
  it("Displays only an Add button when there are no additional funding sources", () => {
    render(
      <AdditionalFundingSourcesArrayFieldTemplate
        // DescriptionField={}
        // TitleField={}
        canAdd={true}
        // className={}
        disabled={false}
        // idSchema={}
        items={[]}
        // onAddClick={}
        // readonly={}
        // required={}
        schema={
          schema.schema.properties.additionalFundingSources as JSONSchema7
        }
        // item.children.props.uiSchema.amount[
        // formData={}
        // registry={}
      />
    );
    expect(
      screen.getByRole("button", { name: /add funding source/i })
    ).toBeVisible();
    expect(screen.queryByRole("button", { name: /remove/i })).toBeNull();
  });

  it("Displays a form and a remove button for every item, and displays an Add button", () => {
    render(
      <div>
        <AdditionalFundingSourcesArrayFieldTemplate
          // DescriptionField={}
          // TitleField={}
          canAdd={true}
          // className={}
          disabled={false}
          // idSchema={}
          items={[
            {
              children: {
                key: null,
                type: jest.fn(),
                props: {},
              },
              className: "array-item",
              disabled: false,
              hasMoveDown: false,
              hasMoveUp: false,
              hasRemove: true,
              hasToolbar: true,
              index: 0,
              key: "key0",
              onAddIndexClick: jest.fn(),
              onDropIndexClick: jest.fn(),
              onReorderClick: jest.fn(),
              readonly: false,
            },
            {
              children: [],
              // {
              //   key: null,
              //   type: jest.fn(),
              //   props: {},
              // },
              className: "array-item",
              disabled: false,
              hasMoveDown: false,
              hasMoveUp: false,
              hasRemove: true,
              hasToolbar: true,
              index: 1,
              key: "key1",
              onAddIndexClick: jest.fn(),
              onDropIndexClick: jest.fn(),
              onReorderClick: jest.fn(),
              readonly: false,
            },
          ]}
          // onAddClick={}
          // readonly={}
          // required={}
          schema={
            schema.schema.properties.additionalFundingSources as JSONSchema7
          }
          uiSchema={fundingParameterEPUiSchema.additionalFundingSources}
          // title={}
          // formContext={}
          // formData={}
          // registry={}
        />
      </div>
    );
    expect(screen.getByText(/additional funding source/)).toBeVisible();
    expect(screen.getAllByRole("button", { name: /remove/i })).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: /add funding source/i })
    ).toBeVisible();
  });
});
