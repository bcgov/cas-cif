import { RelayProps, withRelay } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { useUpdateFormChange } from "mutations/FormChange/updateFormChange";
import { useDeleteFormChange } from "mutations/FormChange/deleteFormChange";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import DefaultLayout from "components/Layout/DefaultLayout";
import SavingIndicator from "components/Form/SavingIndicator";
import FormComponentProps from "components/Form/Interfaces/FormComponentProps";
import withRelayOptions from "lib/relay/withRelayOptions";
import { relayFormPageFactoryQuery } from "__generated__/relayFormPageFactoryQuery.graphql";

export interface FormPageFactoryComponentProps extends FormComponentProps {
  onDiscard: () => void;
}

const getRelayFormPage = (
  onSubmitOrDiscardRoute: any,
  FormComponent: React.FC<FormPageFactoryComponentProps>
) => {
  const pageQuery = graphql`
    query relayFormPageFactoryQuery($formChangeId: ID!) {
      session {
        ...DefaultLayout_session
      }
      formChange(id: $formChangeId) {
        id
        newFormData
        formDataRecordId
        updatedAt
      }
    }
  `;

  function FormPage({
    preloadedQuery,
  }: RelayProps<{}, relayFormPageFactoryQuery>) {
    const { session, formChange } = usePreloadedQuery(
      pageQuery,
      preloadedQuery
    );
    const [updateFormChange, isUpdatingFormChange] = useUpdateFormChange();
    const [deleteFormChange, isDeletingFormChange] = useDeleteFormChange();
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
          router.push(onSubmitOrDiscardRoute);
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
          router.push(onSubmitOrDiscardRoute);
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
        <FormComponent
          formData={formChange.newFormData}
          disabled={isDeletingFormChange || isUpdatingFormChange}
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
        `}</style>
      </DefaultLayout>
    );
  }

  return withRelay(FormPage, pageQuery, withRelayOptions);
};

export default getRelayFormPage;
