import { Button } from "@button-inc/bcgov-theme";
import { FormValidation } from "@rjsf/core";
import FormBase from "components/Form/FormBase";
import FormComponentProps from "components/Form/Interfaces/FormComponentProps";
import SavingIndicator from "components/Form/SavingIndicator";
import contactSchema from "data/jsonSchemaForm/contactSchema";
import useRedirectTo404IfFalsy from "hooks/useRedirectTo404IfFalsy";
import useRedirectToContacts from "hooks/useRedirectToContacts";
import { JSONSchema7 } from "json-schema";
import { useDeleteFormChange } from "mutations/FormChange/deleteFormChange";
import { useCommitFormChange } from "mutations/FormChange/commitFormChange";
import { useUpdateContactFormChange } from "mutations/FormChange/updateContactFormChange";
import { useAddContactToRevision } from "mutations/ProjectContact/addContactToRevision";
import { useUpdateProjectContactFormChange } from "mutations/ProjectContact/updateProjectContactFormChange";
import { useRouter } from "next/router";
import { getContactsPageRoute } from "routes/pageRoutes";
import { graphql, useFragment } from "react-relay";
import { ContactForm_formChange$key } from "__generated__/ContactForm_formChange.graphql";
import { commitFormChangeMutation$data } from "__generated__/commitFormChangeMutation.graphql";
import { addContactToRevisionMutation$data } from "__generated__/addContactToRevisionMutation.graphql";

interface Props extends FormComponentProps {
  formChange: ContactForm_formChange$key;
}

const uiSchema = {
  comments: { "ui:widget": "TextAreaWidget" },
  phone: { "ui:widget": "PhoneNumberWidget" },
};

const ContactForm: React.FC<Props> = (props) => {
  const formChange = useFragment(
    graphql`
      fragment ContactForm_formChange on FormChange {
        id
        rowId
        isUniqueValue(columnName: "email")
        newFormData
        changeStatus
        formDataRecordId
      }
    `,
    props.formChange
  );
  const { isUniqueValue, newFormData } = formChange;

  const router = useRouter();

  const [updateContactFormChange, isUpdatingContactFormChange] =
    useUpdateContactFormChange();
  const [commitFormChange, isCommittingFormChange] = useCommitFormChange();
  const [deleteFormChange, isDeletingFormChange] = useDeleteFormChange();
  // For when redirected from project revision
  const [updateProjectContactFormChangeMutation] =
    useUpdateProjectContactFormChange();
  const [addContactMutation] = useAddContactToRevision();

  // Based on router queries we can determine if the user is coming from project contact form
  const comingFromProjectContactForm = [
    router?.query?.projectRevisionRowId,
    router?.query?.contactIndex,
    router?.query?.projectId,
    router?.query?.connectionString,
  ].every(Boolean);

  // If we don't have the projectContactFormId(means we don't have the primary contact form either) we need to create one
  const existingProjectContactFormId =
    router?.query?.projectContactFormId?.toString();
  const existingProjectContactFormRowId =
    router?.query?.projectContactFormRowId?.toString();

  const handleAfterFormSubmitting = (
    response: commitFormChangeMutation$data
  ) => {
    const updateProjectContactFormChange = (
      res?: addContactToRevisionMutation$data
    ) => {
      updateProjectContactFormChangeMutation({
        variables: {
          input: {
            rowId:
              Number(existingProjectContactFormRowId) ||
              res.addContactToRevision.formChangeEdge.node.rowId,
            formChangePatch: {
              newFormData: {
                contactId:
                  response.commitFormChange.formChange.formDataRecordId,
                projectId: Number(router?.query?.projectId),
                contactIndex: Number(router?.query?.contactIndex),
              },
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

  const isEditing = formChange.formDataRecordId !== null;

  const isRedirecting = useRedirectTo404IfFalsy(formChange);
  const isRedirectingToContacts = useRedirectToContacts(
    formChange.changeStatus,
    comingFromProjectContactForm
  );
  if (isRedirecting || isRedirectingToContacts) return null;

  const handleChange = ({ formData }) => {
    updateContactFormChange({
      variables: {
        input: {
          rowId: formChange.rowId,
          formChangePatch: {
            newFormData: formData,
          },
        },
      },
      optimisticResponse: {
        updateFormChange: {
          formChange: {
            id: formChange.id,
            formDataRecordId: formChange.formDataRecordId,
            newFormData: formData,
            isUniqueValue: isUniqueValue,
            changeStatus: "pending",
          },
        },
      },
      debounceKey: formChange.id,
    });
  };

  const handleSubmit = ({ formData }) => {
    commitFormChange({
      variables: {
        input: {
          rowId: formChange.rowId,
          formChangePatch: {
            newFormData: formData,
          },
        },
      },
      onCompleted: (response) => {
        return comingFromProjectContactForm
          ? handleAfterFormSubmitting(response)
          : router.push(getContactsPageRoute());
      },
      updater: (store) => {
        // Invalidate the entire store, to make sure that we don't display any stale data after redirecting to the next page.
        // This could be optimized to only invalidate the affected records.
        store.invalidateStore();
      },
    });
  };

  const handleDiscard = () => {
    deleteFormChange({
      variables: {
        input: {
          id: formChange.id,
        },
      },
      onCompleted: () => {
        return comingFromProjectContactForm
          ? router.back()
          : router.push(getContactsPageRoute());
      },
    });
  };

  const uniqueEmailValidation = (formData: any, errors: FormValidation) => {
    if (isUniqueValue === false) {
      errors.email.addError("This email already exists in the system");
    }

    return errors;
  };

  return (
    <div>
      <header>
        <h2>{isEditing ? "Edit" : "New"} Contact</h2>
        <SavingIndicator
          isSaved={!isUpdatingContactFormChange && !isCommittingFormChange}
        />
      </header>
      <FormBase
        {...props}
        id="contactForm"
        schema={contactSchema as JSONSchema7}
        uiSchema={uiSchema}
        validate={uniqueEmailValidation}
        formData={newFormData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        disabled={isDeletingFormChange}
      >
        <Button type="submit" style={{ marginRight: "1rem" }}>
          Submit
        </Button>
        <Button type="button" variant="secondary" onClick={handleDiscard}>
          Discard Changes
        </Button>
      </FormBase>
      <style jsx>{`
        header {
          display: flex;
          justify-content: space-between;
          align-items: start;
        }
        header h2 {
          padding-right: 10px;
        }
      `}</style>
    </div>
  );
};

export default ContactForm;
