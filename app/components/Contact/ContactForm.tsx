import { Button } from "@button-inc/bcgov-theme";
import FormBase from "components/Form/FormBase";
import contactSchema from "data/jsonSchemaForm/contactSchema";
import { JSONSchema7 } from "json-schema";
import { FormPageFactoryComponentProps } from "lib/pages/relayFormPageFactory";
import { useUpdateFormChange } from "mutations/FormChange/updateFormChange";
import { useRouter } from "next/router";
import { useUpdateProjectContactFormChange } from "mutations/ProjectContact/updateProjectContactFormChange";
import { useAddContactToRevision } from "mutations/ProjectContact/addContactToRevision";

const uiSchema = {
  comments: { "ui:widget": "TextAreaWidget" },
  phone: { "ui:widget": "PhoneNumberWidget" },
};

const ContactForm: React.FC<FormPageFactoryComponentProps> = (props) => {
  const router = useRouter();

  const [updateFormChange] = useUpdateFormChange();
  const [applyUpdateFormChangeMutation] = useUpdateProjectContactFormChange();
  const [addContactMutation] = useAddContactToRevision();

  // Based on router queries we can determine if the user is coming from project contact form
  const comingFromProjectContactForm = [
    router?.query?.projectRevisionRowId,
    router?.query?.contactIndex,
    router?.query?.projectId,
    router?.query?.connectionString,
  ].every(Boolean);

  // If we don't have the projectContactFormId(means we don't have the primary contact form either) we need to create one
  const existingProjectContactFormId = router?.query?.projectContactFormId;

  const handleAfterFormSubmitting = (response: any) => {
    const updateProjectContactFormChange = (res?: any) => {
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
        debounceKey:
          existingProjectContactFormId ||
          res.addContactToRevision.formChangeEdge.node.id,
        onCompleted: () => router.back(),
      });
    };

    if (existingProjectContactFormId) {
      updateProjectContactFormChange();
    } else {
      // If we don't have the projectContactFormId(means we don't have the primary contact form either) we need to create one
      addContactMutation({
        variables: {
          input: {
            revisionId: Number(router?.query?.projectRevisionRowId),
            contactIndex: Number(router?.query?.contactIndex),
          },
          connections: [router?.query?.connectionString as string],
        },
        onCompleted: (res) => updateProjectContactFormChange(res),
      });
    }
  };

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
      onCompleted: (response) => handleAfterFormSubmitting(response),
      onError: (e) => console.log(e),
      updater: (store) => {
        // Invalidate the entire store, to make sure that we don't display any stale data after redirecting to the next page.
        // This could be optimized to only invalidate the affected records.
        store.invalidateStore();
      },
    });
  };

  // By adding this handler, we are overriding the default onDiscard that is provided by relayFormPageFactory
  const handleDiscard = () =>
    comingFromProjectContactForm ? router.back() : props.onDiscard();

  return (
    <FormBase
      {...props}
      schema={contactSchema as JSONSchema7}
      uiSchema={uiSchema}
      // If the use is coming from project contact form we need to override the default onSubmit handler
      // This is intended to be used for adding new contact and linking it to the project contact form
      onSubmit={comingFromProjectContactForm ? handleSubmit : props.onSubmit}
    >
      <Button type="submit" style={{ marginRight: "1rem" }}>
        Submit
      </Button>
      <Button type="button" variant="secondary" onClick={handleDiscard}>
        Discard Changes
      </Button>
    </FormBase>
  );
};

export default ContactForm;
