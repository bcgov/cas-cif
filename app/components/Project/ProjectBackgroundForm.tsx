import React from "react";
import Form from "lib/theme/service-development-toolkit-form";
import type { JSONSchema7 } from "json-schema";
import FormBorder from "components/Layout/FormBorder";

interface Props {
  formData: any;
  applyChangeFromComponent: (changeObject: object) => void;
}

const schema: JSONSchema7 = {
  type: "object",
  required: ["unique_project_id", "description"],
  properties: {
    unique_project_id: {
      type: "string",
      title: "Unique Project Identifier",
      pattern: "^((d{4})-RFP-([1-2])-(d{3,4})-([A-Z]{4}))$",
    },
    description: { type: "string", title: "Description" },
  },
};

const uiSchema = {
  unique_project_id: {
    "ui:placeholder": "2020-RFP-1-456-ABCD",
    "ui:col-md": 12,
    "bcgov:size": "small",
  },
  description: {
    "ui:placeholder": "describe the project...",
    "ui:col-md": 12,
    "bcgov:size": "small",
  },
};

const ProjectBackgroundForm: React.FunctionComponent<Props> = ({
  formData,
  applyChangeFromComponent,
}) => {
  // We restrict the data to only the fields we care about
  const intialData = {
    unique_project_id: formData.unique_project_id,
    description: formData.description,
  };

  return (
    <>
      <FormBorder title="Background">
        <Form
          schema={schema}
          uiSchema={uiSchema}
          formData={intialData}
          onChange={(change) => {
            console.log(change);
            if (change.errors.length === 0)
              applyChangeFromComponent(change.formData);
          }}
          liveValidate
        />
      </FormBorder>
    </>
  );
};

export default ProjectBackgroundForm;
