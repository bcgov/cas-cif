import ContactForm from "components/Contact/ContactForm";
import withRelayOptions from "lib/relay/withRelayOptions";
import DefaultLayout from "components/Layout/DefaultLayout";
import { getContactsPageRoute } from "pageRoutes";
import { withRelay } from "relay-nextjs";
import { graphql } from "relay-runtime";
import { useUpdateContactFormChange } from "mutations/FormChange/updateContactFormChange";
import { useDeleteFormChange } from "mutations/FormChange/deleteFormChange";
import { usePreloadedQuery } from "react-relay";
import useRedirectTo404IfFalsy from "hooks/useRedirectTo404IfFalsy";
import { FormContactFormQuery } from "__generated__/FormContactFormQuery.graphql";
import { useRouter } from "next/router";
import SavingIndicator from "components/Form/SavingIndicator";
import { RelayProps } from "relay-nextjs";
import useRedirectToContacts from "hooks/useRedirectToContacts";
import { useUpdateProjectContactFormChange } from "mutations/ProjectContact/updateProjectContactFormChange";
import { useAddContactToRevision } from "mutations/ProjectContact/addContactToRevision";

const pageQuery = graphql`
  query FormContactFormQuery($form: ID!) {
    session {
      ...DefaultLayout_session
    }
    formChange(id: $form) {
      id
      formDataRecordId
      changeStatus

      ...ContactForm_formChange
    }
  }
`;

export function ContactFormPage({
  preloadedQuery,
}: RelayProps<{}, FormContactFormQuery>) {
  const { session, formChange } = usePreloadedQuery(pageQuery, preloadedQuery);

  const router = useRouter();

  const [updateContactFormChange, isUpdatingContactFormChange] =
    useUpdateContactFormChange();
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
  const existingProjectContactFormId = router?.query?.projectContactFormId;

  const handleAfterFormSubmitting = (response: any) => {
    console.log(response);
    debugger;
    const updateProjectContactFormChange = (res?: any) => {
      updateProjectContactFormChangeMutation({
        variables: {
          input: {
            id:
              existingProjectContactFormId ||
              res.addContactToRevision.formChangeEdge.node.id,
            formChangePatch: {
              newFormData: {
                contactId:
                  response.updateFormChange.formChange.formDataRecordId,
                projectId: Number(router?.query?.projectId),
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

  const isEditing = formChange.formDataRecordId !== null;

  const isRedirecting = useRedirectTo404IfFalsy(formChange);
  const isRedirectingToContacts = useRedirectToContacts(
    formChange.changeStatus
  );
  if (isRedirecting || isRedirectingToContacts) return null;

  const handleChange = ({ formData }) => {
    updateContactFormChange({
      variables: {
        input: {
          id: formChange.id,
          formChangePatch: {
            newFormData: formData,
          },
        },
      },
      optimisticResponse: {
        updateFormChange: {
          formChange: {
            id: formChange.id,
            newFormData: formData,
            isUniqueValue: true,
            changeStatus: "pending",
          },
        },
      },
      debounceKey: formChange.id,
      onError: (e) => console.log(e),
    });
  };

  const handleSubmit = ({ formData }) => {
    updateContactFormChange({
      variables: {
        input: {
          id: formChange.id,
          formChangePatch: {
            newFormData: formData,
            changeStatus: "committed",
          },
        },
      },
      debounceKey: formChange.id,
      onCompleted: (response) => {
        return comingFromProjectContactForm
          ? handleAfterFormSubmitting(response)
          : router.push(getContactsPageRoute());
      },
      onError: (e) => console.log(e),
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

  return (
    <DefaultLayout session={session}>
      <header>
        <h2>{isEditing ? "Edit" : "New"} Contact</h2>
        <SavingIndicator isSaved={!isUpdatingContactFormChange} />
      </header>
      <ContactForm
        formChange={formChange}
        disabled={isDeletingFormChange}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onDiscard={handleDiscard}
      />
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
    </DefaultLayout>
  );
}

export default withRelay(ContactFormPage, pageQuery, withRelayOptions);
