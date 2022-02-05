import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { ContactFormQuery } from "__generated__/ContactFormQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import ContactForm from "components/Contact/ContactForm";
import { useUpdateFormChange } from "mutations/FormChange/updateFormChange";
import SavingIndicator from "components/Form/SavingIndicator";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { getContactsPageRoute } from "pageRoutes";

const pageQuery = graphql`
  query ContactFormQuery($contactForm: ID!) {
    session {
      ...DefaultLayout_session
    }
    formChange(id: $contactForm) {
      id
      newFormData
      formDataRecordId
      updatedAt
    }
  }
`;

function ContactFormPage({ preloadedQuery }: RelayProps<{}, ContactFormQuery>) {
  const { session, formChange } = usePreloadedQuery(pageQuery, preloadedQuery);
  const [updateFormChange, isUpdatingFormChange] = useUpdateFormChange();
  const router = useRouter();

  const lastEditedDate = useMemo(
    () => new Date(formChange?.updatedAt),
    [formChange?.updatedAt]
  );
  useEffect(() => {
    if (!formChange) router.replace("/404");
  }, [formChange, router]);
  if (!formChange) {
    return null;
  }

  const isEditing = formChange.formDataRecordId !== null;

  const handleChange = (formData) => {
    updateFormChange({
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
          },
        },
      },
      debounceKey: formChange.id,
    });
  };

  const handleSubmit = ({ formData }) => {
    updateFormChange({
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
      onCompleted: () => {
        router.push(getContactsPageRoute());
      },
    });
  };

  return (
    <DefaultLayout session={session}>
      <header>
        <h2>{isEditing ? "Edit" : "New"} Contact</h2>
        <SavingIndicator
          isSaved={!isUpdatingFormChange}
          lastEdited={lastEditedDate}
        />
      </header>
      <ContactForm
        formData={formChange.newFormData}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
      <style jsx>{`
        header {
          display: flex;
          justify-content: space-between;
          align-items: start;
        }
      `}</style>
    </DefaultLayout>
  );
}

export default withRelay(ContactFormPage, pageQuery, withRelayOptions);
