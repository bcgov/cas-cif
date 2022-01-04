import DefaultLayout from "components/Layout/DefaultLayout";
import Grid from "@button-inc/bcgov-theme/Grid";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import Link from "next/link";
import { adminLandingQuery } from "__generated__/adminLandingQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import { getProjectsPageRoute } from "pageRoutes";

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
      <Grid>
        <Grid.Row>
          <Link href="admin/users">
            <a>Users</a>
          </Link>
        </Grid.Row>
        <Grid.Row>
          <Link href={getProjectsPageRoute()}>
            <a>Projects</a>
          </Link>
        </Grid.Row>
      </Grid>
    </DefaultLayout>
  );
}

export default withRelay(AdminLanding, AdminQuery, withRelayOptions);
