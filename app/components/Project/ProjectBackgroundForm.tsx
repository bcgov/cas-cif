import type { JSONSchema7 } from "json-schema";
import FormBase from "./FormBase";

const schema: JSONSchema7 = {
  type: "object",
  required: ["unique_project_id", "description"],
  properties: {
    unique_project_id: {
      type: "string",
      title: "Unique Project Identifier",
      pattern: "^((\\d{4})-RFP-([1-2])-(\\d{3,4})-([A-Z]{4}))$",
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

const createInitialData = (formData) => {
  return {
    unique_project_id: formData.unique_project_id || undefined,
    description: formData.description || undefined,
  };
};

const ProjectBackgroundForm = (props) => {
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
