import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { dashboardQuery } from "__generated__/dashboardQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";

const DashboardQuery = graphql`
  query dashboardQuery {
    query {
      session {
        ...DefaultLayout_session
      }
    }
  }
`;

function Dashboard({ preloadedQuery }: RelayProps<{}, dashboardQuery>) {
  const { query } = usePreloadedQuery(DashboardQuery, preloadedQuery);
  return (
    <DefaultLayout session={query.session}>
      <h1>Dashboard</h1>
    </DefaultLayout>
  );
}
export default withRelay(Dashboard, DashboardQuery, withRelayOptions);
