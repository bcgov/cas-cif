// brianna -- rework all your functions

import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { cifLandingQuery } from "__generated__/cifLandingQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import Dashboard from "components/Dashboard";

const CifLandingQuery = graphql`
  query cifLandingQuery {
    query {
      session {
        ...DefaultLayout_session
      }
      ...Dashboard_query
    }
  }
`;

function CifLanding({ preloadedQuery }: RelayProps<{}, cifLandingQuery>) {
  const { query } = usePreloadedQuery(CifLandingQuery, preloadedQuery);
  return (
    <DefaultLayout session={query.session}>
      <Dashboard query={query} />
    </DefaultLayout>
  );
}

export default withRelay(CifLanding, CifLandingQuery, withRelayOptions);
