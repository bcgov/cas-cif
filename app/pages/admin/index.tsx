import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import Link from "next/link";
import { adminQuery } from "__generated__/adminQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";

const AdminQuery = graphql`
  query adminQuery {
    query {
      session {
        ...DefaultLayout_session
      }
    }
  }
`;

function Users({ preloadedQuery }: RelayProps<{}, adminQuery>) {
  const { query } = usePreloadedQuery(AdminQuery, preloadedQuery);
  return (
    <DefaultLayout session={query.session}>
      <Link href="admin/users">
        <a>Users</a>
      </Link>

      <Link href="dashboard">
        <a>Dashboard</a>
      </Link>
    </DefaultLayout>
  );
}

export default withRelay(Users, AdminQuery, withRelayOptions);
