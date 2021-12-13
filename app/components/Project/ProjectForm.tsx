import type { JSONSchema7 } from "json-schema";
import React from "react";
import FormBase from "../Form/FormBase";
import FormComponentProps from "../Form/FormComponentProps";

const schema: JSONSchema7 = {
  type: "object",
  required: ["rfpNumber", "description"],
  properties: {
    rfpNumber: {
      type: "string",
      title: "RFP Number",
      pattern: "^((\\d{4})-RFP-([1-2])-(\\d{3,4})-([A-Z]{4}))$",
    },
    description: { type: "string", title: "Description" },
  },
};

const uiSchema = {
  rfpNumber: {
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

const ProjectForm: React.FunctionComponent<FormComponentProps> = (props) => {
  return <FormBase {...props} schema={schema} uiSchema={uiSchema} />;
};

export default ProjectForm;
