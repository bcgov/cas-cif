import { Button } from "@button-inc/bcgov-theme";
import FormBase from "components/Form/FormBase";
import { ErrorDisplayer } from "components/Layout/ErrorDisplayer";
import contactSchema from "data/jsonSchemaForm/contactSchema";
import { JSONSchema7 } from "json-schema";
import { FormPageFactoryComponentProps } from "lib/pages/relayFormPageFactory";

const uiSchema = {
  comments: { "ui:widget": "TextAreaWidget" },
  phone: { "ui:widget": "PhoneNumberWidget" },
};

const ContactForm: React.FC<FormPageFactoryComponentProps> = (props) => {
  return (
    <FormBase
      {...props}
      schema={contactSchema as JSONSchema7}
      uiSchema={uiSchema}
    >
      <Button type="submit" style={{ marginRight: "1rem" }}>
        Submit
      </Button>
      <Button type="button" variant="secondary" onClick={props.onDiscard}>
        Discard Changes
      </Button>
      <ErrorDisplayer />
    </FormBase>
  );
};

export default ContactForm;
