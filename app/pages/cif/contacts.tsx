import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { contactsQuery } from "__generated__/contactsQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";

const pageQuery = graphql`
  query contactsQuery {
    session {
      ...DefaultLayout_session
    }
  }
`;

function Contacts({ preloadedQuery }: RelayProps<{}, contactsQuery>) {
  const { session } = usePreloadedQuery(pageQuery, preloadedQuery);
  return <DefaultLayout session={session}></DefaultLayout>;
}

export default withRelay(Contacts, pageQuery, withRelayOptions);
