import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { dashboardQuery } from "__generated__/dashboardQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";

const InternalLandingQuery = graphql`
  query internalLandingQuery {
    query {
      session {
        ...DefaultLayout_session
      }
    }
  }
`;

function InternalLanding({ preloadedQuery }: RelayProps<{}, dashboardQuery>) {
  const { query } = usePreloadedQuery(InternalLandingQuery, preloadedQuery);
  return (
    <DefaultLayout
      session={query.session}
      title="CIF Projects Management"
    ></DefaultLayout>
  );
}

export default withRelay(
  InternalLanding,
  InternalLandingQuery,
  withRelayOptions
);
