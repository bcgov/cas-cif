import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";

import type { loginRedirectQuery } from "__generated__/loginRedirectQuery.graphql";
import defaultRelayOptions from "lib/relay/withRelayOptions";
import { useRouter } from "next/router";

const loginRedirect = graphql`
  query loginRedirectQuery {
    query {
      session {
        ...DefaultLayout_session
      }
    }
  }
`;

const LoginRedirect = ({
  preloadedQuery,
}: RelayProps<{}, loginRedirectQuery>) => {
  const { query } = usePreloadedQuery(loginRedirect, preloadedQuery);
  const router = useRouter();

  const headerText = router.query.sessionIdled
    ? "You were logged out due to inactivity."
    : "You need to be logged in to access this page.";
  return (
    <DefaultLayout session={query.session}>
      <h3 className="blue">{headerText}</h3>
      <p>
        Please log in to access this page.
        <br />
        You will be redirected to the requested page after doing so.
      </p>
    </DefaultLayout>
  );
};

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

    // we don't care about the actual base here, just want to parse the search params
    const url = new URL(ctx.req.url, "https://example.org/");

    return {
      redirect: {
        destination: url.searchParams.get("redirectTo") || "/",
      },
    };
  },
};

export default withRelay(LoginRedirect, loginRedirect, withRelayOptions);
