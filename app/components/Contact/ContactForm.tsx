import { Button } from "@button-inc/bcgov-theme";
import FormBase from "components/Form/FormBase";
import FormComponentProps from "components/Form/FormComponentProps";
import contactSchema from "data/jsonSchemaForm/contactSchema";
import { JSONSchema7 } from "json-schema";

const uiSchema = {
  comments: { "ui:widget": "TextAreaWidget" },
};

const ContactForm: React.FC<FormComponentProps> = (props) => {
  return (
    <FormBase
      {...props}
      schema={contactSchema as JSONSchema7}
      uiSchema={uiSchema}
    >
      <Button type="submit">Submit</Button>
    </FormBase>
  );
};

export default ContactForm;
