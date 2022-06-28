import { Button } from "@button-inc/bcgov-theme";
import { FormValidation } from "@rjsf/core";
import FormBase from "components/Form/FormBase";
import FormComponentProps from "components/Form/Interfaces/FormComponentProps";
import contactSchema from "data/jsonSchemaForm/contactSchema";
import { JSONSchema7 } from "json-schema";
import { graphql, useFragment } from "react-relay";
import { ContactForm_formChange$key } from "__generated__/ContactForm_formChange.graphql";

interface Props extends FormComponentProps {
  onDiscard: () => void;
  formChange: ContactForm_formChange$key;
  disabled: boolean;
}

const uiSchema = {
  comments: { "ui:widget": "TextAreaWidget" },
  phone: { "ui:widget": "PhoneNumberWidget" },
};

const ContactForm: React.FC<Props> = (props) => {
  const { formChange } = props;
  const { isUniqueValue, newFormData } = useFragment(
    graphql`
      fragment ContactForm_formChange on FormChange {
        isUniqueValue(columnName: "email")
        newFormData
      }
    `,
    formChange
  );

  const uniqueEmailValidation = (formData: any, errors: FormValidation) => {
    if (isUniqueValue === false) {
      errors.email.addError("This email already exists in the system");
    }

    return errors;
  };

  return (
    <FormBase
      {...props}
      id="contactForm"
      schema={contactSchema as JSONSchema7}
      uiSchema={uiSchema}
      validate={uniqueEmailValidation}
      formData={newFormData}
    >
      <Button type="submit" style={{ marginRight: "1rem" }}>
        Submit
      </Button>
      <Button type="button" variant="secondary" onClick={props.onDiscard}>
        Discard Changes
      </Button>
    </FormBase>
  );
};

export default ContactForm;
