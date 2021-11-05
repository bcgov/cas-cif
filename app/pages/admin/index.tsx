import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import Link from "next/link";
import { adminLandingQuery } from "__generated__/adminLandingQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";

const AdminQuery = graphql`
  query adminLandingQuery {
    query {
      session {
        ...DefaultLayout_session
      }
    }
  }
`;

function AdminLanding({ preloadedQuery }: RelayProps<{}, adminLandingQuery>) {
  const { query } = usePreloadedQuery(AdminQuery, preloadedQuery);
  return (
    <DefaultLayout session={query.session} title="CIF Projects Administration">
      <Link href="admin/users">
        <a>Users</a>
      </Link>

      <Link href="dashboard">
        <a>Dashboard</a>
      </Link>
    </DefaultLayout>
  );
}

export default withRelay(AdminLanding, AdminQuery, withRelayOptions);
