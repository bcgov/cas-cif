import { Button } from "@button-inc/bcgov-theme";
import FormBase from "components/Form/FormBase";
import FormComponentProps from "components/Form/FormComponentProps";
import contactSchema from "data/jsonSchemaForm/contactSchema";
import { JSONSchema7 } from "json-schema";

const uiSchema = {
  comments: { "ui:widget": "TextAreaWidget" },
};

interface Props extends FormComponentProps {
  disabled?: boolean;
  onDiscard: () => void;
}

const ContactForm: React.FC<Props> = (props) => {
  return (
    <FormBase
      {...props}
      schema={contactSchema as JSONSchema7}
      uiSchema={uiSchema}
    >
      <Button type="submit">Submit</Button>
      <Button type="button" onClick={props.onDiscard}>
        Discard Changes
      </Button>
    </FormBase>
  );
};

export default ContactForm;
