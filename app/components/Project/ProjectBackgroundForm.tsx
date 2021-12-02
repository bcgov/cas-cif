import React from "react";
import Form from "lib/theme/service-development-toolkit-form";
import type { JSONSchema7 } from "json-schema";

interface Props {
  formData: any;
  applyChangeFromComponent: (changeObject: object) => void;
}

const schema: JSONSchema7 = {
  type: "object",
  required: ["unique_project_id", "description"],
  properties: {
    unique_project_id: { type: "string", title: "Unique Project Identifier" },
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
    uniqueProjectId: formData.uniqueProjectId,
    description: formData.description,
  };

  return (
    <>
      <fieldset>
        <legend>Project Background</legend>
        <Form
          schema={schema}
          uiSchema={uiSchema}
          formData={intialData}
          onChange={(change) => {
            applyChangeFromComponent(change.formData);
          }}
        />
      </fieldset>
      <style jsx>
        {`
          fieldset > legend {
            margin: 0 auto;
          }
        `}
      </style>
    </>
  );
};

export default ProjectBackgroundForm;
