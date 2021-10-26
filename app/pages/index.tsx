import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { getUserGroups } from "server/helpers/userGroupAuthentication";
import { getUserGroupLandingRoute } from "lib/userGroups";
import { pagesQuery } from "__generated__/pagesQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";

const IndexQuery = graphql`
  query pagesQuery {
    query {
      session {
        ...DefaultLayout_session
      }
    }
  }
`;

function Index({ preloadedQuery }: RelayProps<{}, pagesQuery>) {
  const { query } = usePreloadedQuery(IndexQuery, preloadedQuery);

  return (
    <DefaultLayout session={query.session}>
      <div>
        <p>Welcome to the cif web application.</p>
      </div>
    </DefaultLayout>
  );
}

export default withRelay(Index, IndexQuery, {
  ...withRelayOptions,
  serverSideProps: async (ctx) => {
    // Server-side redirection of the user to their landing route, if they are logged in
    const groups = getUserGroups(ctx.req);
    const landingRoute = getUserGroupLandingRoute(groups);
    if (landingRoute === "/") return {};

    return {
      redirect: { destination: landingRoute, permanent: false },
    };
  },
});
