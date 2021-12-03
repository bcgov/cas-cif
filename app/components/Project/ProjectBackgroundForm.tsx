import React, { useEffect, useRef } from "react";
import Form from "lib/theme/service-development-toolkit-form";
import type { JSONSchema7 } from "json-schema";
import FormBorder from "components/Layout/FormBorder";

interface Props {
  formData: any;
  applyChangesFromComponent: (changeObject: object) => void;
  onFormErrors: (errorsObject: []) => void;
}

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

const ProjectBackgroundForm: React.FunctionComponent<Props> = ({
  formData,
  applyChangesFromComponent,
  onFormErrors,
}) => {
  // We restrict the data to only the fields we care about
  const intialData = {
    unique_project_id: formData.unique_project_id,
    description: formData.description,
  };

  const formRef = useRef();

  useEffect(() => {
    const { errors } = formRef.current.validate(intialData, schema);
    onFormErrors(errors);
  }, []);

  return (
    <>
      <FormBorder title="Background">
        <Form
          // @ts-ignore
          ref={formRef}
          schema={schema}
          uiSchema={uiSchema}
          formData={intialData}
          onChange={(change) => {
            applyChangesFromComponent(change.formData);
            onFormErrors(change.errors);
          }}
          liveValidate
        ></Form>
      </FormBorder>
    </>
  );
};

export default ProjectBackgroundForm;
