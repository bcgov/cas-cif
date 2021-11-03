import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";

import type { loginRedirectQuery } from "__generated__/loginRedirectQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
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

export default withRelay(LoginRedirect, loginRedirect, withRelayOptions);
