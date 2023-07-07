import { withTheme } from "@rjsf/core";
import FormBorder from "lib/theme/components/FormBorder";
import formTheme from "lib/theme/FormWithTheme";
import { Fragment } from "react";

export const generateSchemaProperty = (
  propertyKey,
  propertyType,
  propertyTitle,
  propertyDefault
) => {
  if (!propertyKey) return {};
  return {
    [propertyKey]: {
      type: propertyType,
      title: propertyTitle,
      default: propertyDefault,
    },
  };
};

export const generateSchema = (type, title, properties) => {
  return {
    type,
    title,
    properties,
  };
};

export const generateNotifyModalForm = (
  schema,
  onChange,
  formData,
  uiSchema
) => {
  const ModalForm = withTheme(formTheme);
  const pageToAddMissingInformation = schema.title.includes("Contact")
    ? "Contacts"
    : "Managers";
  return Object.keys(schema.properties).length !== 0 ? (
    <>
      <ModalForm
        schema={schema}
        onChange={onChange}
        formData={formData}
        uiSchema={uiSchema}
      >
        {/* hide the submit button */}
        <Fragment />
      </ModalForm>
      <style jsx>{`
        legend {
          font-weight: bold;
        }
        fieldset {
          border: none;
          padding: 0em;
        }
      `}</style>
    </>
  ) : (
    <FormBorder title={schema.title}>
      {schema.title === "Director"
        ? "None added"
        : `Not added before. You can select one on the Project Details > Project ${pageToAddMissingInformation} page.`}
    </FormBorder>
  );
};

export const generateModalUiSchema = (
  key: string,
  pageRedirect?: "Contacts" | "Managers"
) => {
  return {
    [key]: {
      "ui:widget": "ModalWidget",
      "ui:options": {
        label: false,
      },
      pageRedirect: pageRedirect,
    },
  };
};

export const cleanupNestedNodes = (array) => {
  if (!array) return undefined;
  return array.map(({ node }) => node);
};
