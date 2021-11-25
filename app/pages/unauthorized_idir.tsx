import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { unauthorizedIdirQuery } from "__generated__/unauthorizedIdirQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";

const UnauthorizedIdirQuery = graphql`
  query unauthorizedIdirQuery {
    query {
      session {
        ...DefaultLayout_session
      }
    }
  }
`;

function UnauthorizedIdir({
  preloadedQuery,
}: RelayProps<{}, unauthorizedIdirQuery>) {
  const { query } = usePreloadedQuery(UnauthorizedIdirQuery, preloadedQuery);
  return (
    <DefaultLayout session={query.session} title="Access not granted">
      <p>
        You have not been granted access to this application yet, please contact
        an administrator to add your IDIR to the appropriate group(s).
      </p>
    </DefaultLayout>
  );
}

export default withRelay(
  UnauthorizedIdir,
  UnauthorizedIdirQuery,
  withRelayOptions
);
