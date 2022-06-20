import { Button } from "@button-inc/bcgov-theme";
import FormBase from "components/Form/FormBase";
import contactSchema from "data/jsonSchemaForm/contactSchema";
import { JSONSchema7 } from "json-schema";
import { FormPageFactoryComponentProps } from "lib/pages/relayFormPageFactory";
import { useUpdateFormChange } from "mutations/FormChange/updateFormChange";
import { useRouter } from "next/router";
import { useUpdateProjectContactFormChange } from "mutations/ProjectContact/updateProjectContactFormChange";

const uiSchema = {
  comments: { "ui:widget": "TextAreaWidget" },
  phone: { "ui:widget": "PhoneNumberWidget" },
};

const ContactForm: React.FC<FormPageFactoryComponentProps> = (props) => {
  const router = useRouter();

  const [updateFormChange] = useUpdateFormChange();
  const [applyUpdateFormChangeMutation] = useUpdateProjectContactFormChange();

  // By adding this submit, we are overriding the default submit that is provided by relayFormPageFactory
  const handleSubmit = ({ formData }) => {
    const contactFormId = router.query.form as string;
    updateFormChange({
      variables: {
        input: {
          id: contactFormId,
          formChangePatch: {
            newFormData: formData,
            changeStatus: "committed",
          },
        },
      },
      debounceKey: contactFormId,
      onCompleted: (response) =>
        // Passing the newly created contact id to this mutation
        applyUpdateFormChangeMutation({
          variables: {
            input: {
              id: router?.query?.projectContactFormId as string,
              formChangePatch: {
                newFormData: {
                  contactId:
                    response.updateFormChange.formChange.formDataRecordId,
                  projectId: router?.query?.projectId as string,
                  contactIndex: Number(router?.query?.contactIndex),
                },
                changeStatus: "pending",
              },
            },
          },
          debounceKey: router?.query?.projectContactFormId as string,
          onCompleted: () => router.back(),
        }),
      onError: (e) => console.log(e),
      updater: (store) => {
        // Invalidate the entire store, to make sure that we don't display any stale data after redirecting to the next page.
        // This could be optimized to only invalidate the affected records.
        store.invalidateStore();
      },
    });
  };

  return (
    <FormBase
      {...props}
      schema={contactSchema as JSONSchema7}
      uiSchema={uiSchema}
      // If we have contactIndex(this can be revisionId or connectionString as well) in the route query, we need to override the default onSubmit handler
      // This is intended to be used for adding new contact and linking it to the project contact form
      onSubmit={router?.query?.contactIndex ? handleSubmit : props.onSubmit}
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
