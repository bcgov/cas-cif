import type { JSONSchema7 } from "json-schema";
import React from "react";
import FormBase from "./FormBase";
import FormComponentProps from "./FormComponentProps";

const schema: JSONSchema7 = {
  type: "object",
  properties: {
    project_manager: {
      type: "number",
      title: "Project Manager",
      anyOf: [
        {
          type: "number",
          title: "Pierre",
          enum: [1],
        },
        {
          type: "number",
          title: "Alex",
          enum: [2],
        },
      ],
    },
  },
};

const ProjecManagerForm: React.FunctionComponent<FormComponentProps> = (
  props
) => {
  const uiSchema = {
    project_manager: {
      "ui:col-md": 6,
      "bcgov:size": "small",
    },
  };

  return <FormBase {...props} schema={schema} uiSchema={uiSchema} />;
};

export default ProjecManagerForm;
