import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { pagesQuery } from "__generated__/pagesQuery.graphql";
import defaultRelayOptions from "lib/relay/withRelayOptions";
import { getUserGroupLandingRoute } from "lib/userGroups";
import { useFeature } from "@growthbook/growthbook-react";

export const IndexQuery = graphql`
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
  const showFlaggedItem = useFeature("flagged-item").on;

  return (
    <DefaultLayout session={query.session}>
      <div>
        <p>Welcome to the cif web application.</p>
        {showFlaggedItem && <p>Hello there. I am a flag!</p>}
      </div>
    </DefaultLayout>
  );
}

export const withRelayOptions = {
  ...defaultRelayOptions,
  serverSideProps: async (ctx) => {
    const props = await defaultRelayOptions.serverSideProps(ctx);
    if ("redirect" in props) return props;
    const { getUserGroups } = await import(
      "server/helpers/userGroupAuthentication"
    );

    const groups = getUserGroups(ctx.req);
    if (groups.length === 0) return {};
    return {
      redirect: {
        destination: getUserGroupLandingRoute(groups),
      },
    };
  },
};

export default withRelay(Index, IndexQuery, withRelayOptions);
