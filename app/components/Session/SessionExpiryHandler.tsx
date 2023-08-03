import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import type { SessionExpiryHandlerQuery } from "__generated__/SessionExpiryHandlerQuery.graphql";
import { graphql, fetchQuery, useRelayEnvironment } from "react-relay";
import SessionTimeoutHandler from "./SessionTimeoutHandler";

const sessionQuery = graphql`
  query SessionExpiryHandlerQuery {
    session {
      __typename
    }
  }
`;

const SessionExpiryHandler: React.FC = () => {
  const [hasSession, setHasSession] = useState(false);

  const router = useRouter();
  const environment = useRelayEnvironment();

  useEffect(() => {
    const checkSessionAndGroups = async () => {
      const { session } = await fetchQuery<SessionExpiryHandlerQuery>(
        environment,
        sessionQuery,
        {}
      ).toPromise();
      setHasSession(!!session);
    };
    checkSessionAndGroups();
    // This effect only needs to be run once on mount, even if the relay environment changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSessionExpired = () => {
    setHasSession(false);
    router.push({
      pathname: "/login-redirect",
      query: {
        redirectTo: router.asPath,
        sessionIdled: true,
      },
    });
  };

  if (hasSession)
    return (
      <SessionTimeoutHandler
        onSessionExpired={handleSessionExpired}
        extendSessionOnEvents={{
          enabled: true,
          throttleTime: 4 * 60 * 1000, // 4 minutes
          events: ["keydown", "mousedown", "scroll"],
        }}
      />
    );

  return null;
};

export default SessionExpiryHandler;
