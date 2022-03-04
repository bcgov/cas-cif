import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import withRelayOptions from "lib/relay/withRelayOptions";
import { useRouter } from "next/router";
import { getContactFormPageRoute } from "pageRoutes";
import { ContactViewQuery } from "__generated__/ContactViewQuery.graphql";
import { Button } from "@button-inc/bcgov-theme";
import useCreateEditContactFormChange from "mutations/Contact/createEditContactFormChange";
import { createEditContactFormChangeMutation$data } from "__generated__/createEditContactFormChangeMutation.graphql";

const pageQuery = graphql`
  query ContactViewQuery($contact: ID!) {
    session {
      ...DefaultLayout_session
    }
    contact(id: $contact) {
      id
      rowId
      fullName
      fullPhone
      email
      position
      comments
      pendingFormChange {
        id
      }
    }
  }
`;

export function ContactViewPage({
  preloadedQuery,
}: RelayProps<{}, ContactViewQuery>) {
  const { session, contact } = usePreloadedQuery(pageQuery, preloadedQuery);
  const router = useRouter();
  const [startContactRevision, isStartingContactRevision] =
    useCreateEditContactFormChange();

  const handleEditContact = () => {
    startContactRevision({
      variables: { contactRowId: contact.rowId },
      onCompleted: (response: createEditContactFormChangeMutation$data) => {
        router.push(
          getContactFormPageRoute(response.createFormChange.formChange.id)
        );
      },
    });
  };

  const editButton = contact.pendingFormChange ? (
    <Button
      size="small"
      onClick={() =>
        router.push(getContactFormPageRoute(contact.pendingFormChange.id))
      }
    >
      Resume Editing
    </Button>
  ) : (
    <Button
      size="small"
      disabled={isStartingContactRevision}
      onClick={handleEditContact}
    >
      Edit
    </Button>
  );

  return (
    <DefaultLayout session={session}>
      <header>
        <h2>Contact Information</h2>
        {editButton}
      </header>
      <dl>
        <dt>Name</dt>
        <dd>{contact.fullName}</dd>

        <dt>Phone</dt>
        <dd>{contact.fullPhone}</dd>

        <dt>Email</dt>
        <dd>{contact.email}</dd>

        {contact.position && (
          <>
            <dt>Position</dt>
            <dd>{contact.position}</dd>
          </>
        )}

        {contact.comments && (
          <>
            <dt>Comments</dt>
            <dd className="preformatted">{contact.comments}</dd>
          </>
        )}
      </dl>
      <style jsx>{`
        header {
          display: flex;
          justify-content: space-between;
          align-items: start;
        }
        header h2 {
          padding-right: 10px;
        }
        .preformatted {
          white-space: pre-wrap;
        }
      `}</style>
    </DefaultLayout>
  );
}

export default withRelay(ContactViewPage, pageQuery, withRelayOptions);
