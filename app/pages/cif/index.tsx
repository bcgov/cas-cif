import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { cifLandingQuery } from "__generated__/cifLandingQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";

const CifLandingQuery = graphql`
  query cifLandingQuery {
    query {
      session {
        ...DefaultLayout_session
      }
    }
  }
`;

function CifLanding({ preloadedQuery }: RelayProps<{}, cifLandingQuery>) {
  const { query } = usePreloadedQuery(CifLandingQuery, preloadedQuery);
  return <DefaultLayout session={query.session}></DefaultLayout>;
}

export default withRelay(CifLanding, CifLandingQuery, withRelayOptions);
