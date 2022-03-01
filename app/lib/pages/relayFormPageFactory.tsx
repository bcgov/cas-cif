import { RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { useUpdateFormChange } from "mutations/FormChange/updateFormChange";
import { useDeleteFormChange } from "mutations/FormChange/deleteFormChange";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import DefaultLayout from "components/Layout/DefaultLayout";
import SavingIndicator from "components/Form/SavingIndicator";
import FormComponentProps from "components/Form/Interfaces/FormComponentProps";
import { relayFormPageFactoryQuery } from "__generated__/relayFormPageFactoryQuery.graphql";
import { GraphQLTaggedNode } from "relay-runtime";

export interface FormPageFactoryComponentProps extends FormComponentProps {
  onDiscard: () => void;
}

const pageQuery = graphql`
  query relayFormPageFactoryQuery($form: ID!) {
    session {
      ...DefaultLayout_session
    }
    formChange(id: $form) {
      id
      newFormData
      formDataRecordId
      updatedAt
    }
  }
`;

/**
 * A factory function that creates a page component for a form_change record.
 *
 * It abstracts away the submit, discard and change behaviours from the
 * individual forms, as well as the relay form change query, session and layouts.
 *
 * @param resourceTitle The title of the resource, for which the form is being created (e.g. "Operator")
 * @param onSubmitOrDiscardRoute The route to navigate to when the form is submitted or discarded
 * @param FormComponent The form component to render
 * @returns a tuple [FormPage, query] where FormPage is the page component to render, and query is the relay query.
 *          it is meant to be used in the withRelay HOC (e.g. withRelay(FormPage, query, withRelayOptions)).
 */

const relayFormPageFactory = (
  resourceTitle: string,
  onSubmitOrDiscardRoute: any,
  FormComponent: React.FC<FormPageFactoryComponentProps>
) => {
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

    const handleChange = ({ formData }) => {
      console.log("handleChange", formData);

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
        onError: (e) => console.log(e),
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
        onError: (e) => console.log(e),
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
          <h2>
            {isEditing ? "Edit" : "New"} {resourceTitle}
          </h2>
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

  return [FormPage, pageQuery] as [
    ({
      preloadedQuery,
    }: RelayProps<{}, relayFormPageFactoryQuery>) => JSX.Element,
    GraphQLTaggedNode
  ];
};

export default relayFormPageFactory;
