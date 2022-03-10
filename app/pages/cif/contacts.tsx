import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { contactsQuery } from "__generated__/contactsQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import { NoHeaderFilter, TextFilter } from "components/Table/Filters";
import Table from "components/Table";
import ContactTableRow from "components/Contact/ContactTableRow";
import { Button } from "@button-inc/bcgov-theme";
import { useCreateNewContactFormChange } from "mutations/Contact/createNewContactFormChange";
import { useRouter } from "next/router";
import { createNewContactFormChangeMutation$data } from "__generated__/createNewContactFormChangeMutation.graphql";
import { getContactFormPageRoute } from "pageRoutes";

const pageQuery = graphql`
  query contactsQuery(
    $fullName: String
    $fullPhone: String
    $position: String
    $offset: Int
    $pageSize: Int
    $orderBy: [ContactsOrderBy!]
  ) {
    session {
      ...DefaultLayout_session
    }

    allContacts(
      first: $pageSize
      offset: $offset
      filter: {
        fullName: { includesInsensitive: $fullName }
        fullPhone: { includesInsensitive: $fullPhone }
        position: { includesInsensitive: $position }
      }
      orderBy: $orderBy
    ) {
      totalCount
      edges {
        node {
          id
          ...ContactTableRow_contact
        }
      }
    }
    pendingNewContactFormChange: pendingNewFormChangeForTable(
      tableName: "contact"
    ) {
      id
    }
  }
`;

const tableFilters = [
  new TextFilter("Full Name", "fullName"),
  new TextFilter("Phone", "fullPhone"),
  new TextFilter("Position", "position"),
  new NoHeaderFilter(),
];

function Contacts({ preloadedQuery }: RelayProps<{}, contactsQuery>) {
  const { session, allContacts, pendingNewContactFormChange } =
    usePreloadedQuery(pageQuery, preloadedQuery);
  const router = useRouter();
  const [addContact, isAddingContact] = useCreateNewContactFormChange();

  const handleAddContact = () => {
    addContact({
      variables: {},
      onCompleted: (response: createNewContactFormChangeMutation$data) => {
        router.push(
          getContactFormPageRoute(response.createFormChange.formChange.id)
        );
      },
    });
  };

  const handleResumeAddContact = () => {
    router.push(getContactFormPageRoute(pendingNewContactFormChange.id));
  };

  const createOrResumeButton = pendingNewContactFormChange ? (
    <Button onClick={handleResumeAddContact}>Resume Contact Creation</Button>
  ) : (
    <Button onClick={handleAddContact} disabled={isAddingContact}>
      Add a Contact
    </Button>
  );

  return (
    <DefaultLayout session={session}>
      <header>
        <h2>Contacts</h2>
        {createOrResumeButton}
      </header>
      <Table
        paginated
        totalRowCount={allContacts.totalCount}
        filters={tableFilters}
      >
        {allContacts.edges.map(({ node }) => (
          <ContactTableRow key={node.id} contact={node} />
        ))}
      </Table>
    </DefaultLayout>
  );
}

export default withRelay(Contacts, pageQuery, withRelayOptions);
