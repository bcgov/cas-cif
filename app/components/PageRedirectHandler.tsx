import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { getUserGroupLandingRoute } from "lib/userGroups";
import type { PageRedirectHandlerQuery } from "__generated__/PageRedirectHandlerQuery.graphql";
import { isRouteAuthorized } from "lib/authorization";
import {
  usePreloadedQuery,
  useQueryLoader,
  graphql,
  PreloadedQuery,
} from "react-relay";
import { SessionTimeoutHandler, SessionRefresher } from "@bcgov-cas/sso-react";

const sessionQuery = graphql`
  query PageRedirectHandlerQuery {
    session {
      userGroups
    }
  }
`;

interface Props {
  queryReference: PreloadedQuery<PageRedirectHandlerQuery>;
}

const PageRenderer: React.FC<Props> = ({ children, queryReference }) => {
  console.log("rendering");

  const { session } = usePreloadedQuery(sessionQuery, queryReference);
  console.log("session", session);
  const router = useRouter();

  const handleSessionExpired = () => {
    router.push({
      pathname: "/login-redirect",
      query: {
        redirectTo: router.asPath,
        sessionIdled: true,
      },
    });
  };

  const canAccess = isRouteAuthorized(router.pathname, session?.userGroups);
  console.log("canAccess", canAccess);
  // user is not logged in
  if (!canAccess && !session) {
    router.push({
      pathname: "/login-redirect",
      query: {
        redirectTo: router.asPath,
      },
    });
    return null;
  }

  // Redirect users attempting to access a page that their group doesn't allow
  // to their landing route.
  if (!canAccess) {
    router.push({
      pathname: getUserGroupLandingRoute(session?.userGroups),
    });
    return null;
  }

  return (
    <>
      {session && (
        <>
          <SessionRefresher />
          <SessionTimeoutHandler onSessionExpired={handleSessionExpired} />
        </>
      )}

      {children}
    </>
  );
};

const SessionQueryLoader = ({ children }) => {
  const [queryReference, loadQuery] =
    useQueryLoader<PageRedirectHandlerQuery>(sessionQuery);

  useEffect(() => {
    loadQuery({});
  }, [loadQuery]);

  console.log("queryReference", queryReference);

  return queryReference != null ? (
    <PageRenderer queryReference={queryReference}>{children}</PageRenderer>
  ) : null;
};

export default SessionQueryLoader;
