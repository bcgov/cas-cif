import type { JSONSchema7 } from "json-schema";
import React from "react";
import FormBase from "./FormBase";
import FormComponentProps from "./FormComponentProps";

const schema: JSONSchema7 = {
  type: "object",
  required: ["rfp_number", "description"],
  properties: {
    rfp_number: {
      type: "string",
      title: "RFP Number",
      pattern: "^((\\d{4})-RFP-([1-2])-(\\d{3,4})-([A-Z]{4}))$",
    },
    description: { type: "string", title: "Description" },
  },
};

const uiSchema = {
  rfp_number: {
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

const createInitialData = (formData) => {
  return {
    rfp_number: formData.rfp_number || undefined,
    description: formData.description || undefined,
  };
};

const ProjectBackgroundForm: React.FunctionComponent<FormComponentProps> = (
  props
) => {
  return (
    <FormBase
      {...props}
      createInitialData={createInitialData}
      schema={schema}
      uiSchema={uiSchema}
    />
  );
};

export default ProjectBackgroundForm;
