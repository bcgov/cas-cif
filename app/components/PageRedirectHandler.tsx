import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { PageRedirectHandlerQuery } from "__generated__/PageRedirectHandlerQuery.graphql";
import { graphql, fetchQuery, useRelayEnvironment } from "react-relay";
import { SessionTimeoutHandler, SessionRefresher } from "@bcgov-cas/sso-react";
import { isRouteAuthorized } from "lib/authorization";
import { getUserGroupLandingRoute } from "lib/userGroups";

const sessionQuery = graphql`
  query PageRedirectHandlerQuery {
    session {
      userGroups
    }
  }
`;

const PageRenderer: React.FC = () => {
  const [userGroups, setUserGroups] = useState<readonly string[]>([]);

  const router = useRouter();
  const environment = useRelayEnvironment();

  useEffect(() => {
    const checkSessionAndGroups = async () => {
      const { session } = await fetchQuery<PageRedirectHandlerQuery>(
        environment,
        sessionQuery,
        {}
      ).toPromise();
      setUserGroups(session?.userGroups || []);
    };
    checkSessionAndGroups();
  }, []);

  const handleSessionExpired = () => {
    router.push({
      pathname: "/login-redirect",
      query: {
        redirectTo: router.asPath,
        sessionIdled: true,
      },
    });
  };

  // useEffect(() => {
  //   const handleRouteChange = (url) => {
  //     if (url.startsWith("/login-redirect")) {
  //       return;
  //     }

  //     const canAccess = isRouteAuthorized(url, userGroups);
  //     // user is not logged in
  //     if (!canAccess && userGroups.length === 0) {
  //       router.push({
  //         pathname: "/login-redirect",
  //         query: {
  //           redirectTo: url,
  //         },
  //       });
  //       return null;
  //     }

  //     // Redirect users attempting to access a page that their group doesn't allow
  //     // to their landing route.
  //     if (!canAccess) {
  //       router.push({
  //         pathname: getUserGroupLandingRoute(userGroups),
  //       });
  //       return null;
  //     }
  //   };

  //   router.events.on("routeChangeStart", handleRouteChange);

  //   return () => {
  //     router.events.off("routeChangeStart", handleRouteChange);
  //   };
  // }, []);

  if (userGroups.length > 0)
    return (
      <>
        <SessionRefresher />
        <SessionTimeoutHandler onSessionExpired={handleSessionExpired} />
      </>
    );

  return null;
};

export default PageRenderer;
