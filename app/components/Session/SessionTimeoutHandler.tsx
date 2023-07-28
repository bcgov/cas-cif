import { throttleEventsEffect } from "@bcgov-cas/sso-react";
import LogoutWarningModal, {
  WarningModalProps,
} from "@bcgov-cas/sso-react/dist/LogoutWarningModal";
import React, { useEffect, useState } from "react";
// Delay to avoid race condition with the server. On session expiry, we wait
// an additional delay to make sure the session is expired.
const SERVER_DELAY_SECONDS = 2;

type SessionTimeoutHandlerProps = {
  modalDisplaySecondsBeforeLogout?: number;
  sessionRemainingTimePath?: string;
  logoutPath?: string;

  // Callback for when the session has expired
  onSessionExpired?: () => void;

  // Session-expired effect will recheck the session
  // if any of these values change.
  // e.g. with Next.js, use [router] where router = useRouter()
  resetOnChange?: any[];
  renderModal?: (props: WarningModalProps) => JSX.Element;

  // Configuration for automatically extending the session,
  // based on certain user events to listen to.
  // Don't set or set enabled: false to disable.
  extendSessionOnEvents?: {
    enabled: boolean;
    throttleTime?: number;
    events?: string[];
  };
};

const SessionTimeoutHandler: React.FunctionComponent<
  SessionTimeoutHandlerProps
> = ({
  modalDisplaySecondsBeforeLogout = 120,
  sessionRemainingTimePath = "/session-idle-remaining-time",
  logoutPath = "/logout",
  onSessionExpired,
  resetOnChange = [],
  renderModal,
  extendSessionOnEvents,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(Infinity);

  const fetchSessionTimeout = async () => {
    const response = await fetch(sessionRemainingTimePath);
    if (response.ok) {
      const timeout = Number(await response.json());
      if (timeout > modalDisplaySecondsBeforeLogout) {
        setShowModal(false);
      }
      setSessionTimeout(timeout);
    } else {
      if (onSessionExpired) onSessionExpired();
    }
  };

  // default values will be used for throttleTime
  // and events if they are undefined.
  useEffect(() => {
    if (extendSessionOnEvents?.enabled) {
      const throttleEffect = throttleEventsEffect(
        fetchSessionTimeout,
        extendSessionOnEvents.throttleTime,
        extendSessionOnEvents.events
      );
      throttleEffect();
    }
  }, []);

  useEffect(() => {
    let modalTimeoutId: ReturnType<typeof setTimeout>;

    const timeout = sessionTimeout;

    if (timeout === Infinity) return;
    if (timeout <= 0 && onSessionExpired) onSessionExpired();

    if (timeout > modalDisplaySecondsBeforeLogout) {
      setShowModal(false);
      modalTimeoutId = setTimeout(() => {
        setShowModal(true);
      }, (timeout + SERVER_DELAY_SECONDS - modalDisplaySecondsBeforeLogout) * 1000);
    } else {
      setShowModal(true);
    }

    // If the user has not extended their session by then we will redirect them (by invoking logoutOnSessionIdled() below)
    // If they do extend their session (or have in a different tab), the `checkSessionIdle()` call will branch into the first condition above, hide the modal,
    // and set another timeout to check the session idle when the modal is due to be displayed.

    const sessionTimeoutId = setTimeout(() => {
      fetchSessionTimeout();
    }, (timeout + SERVER_DELAY_SECONDS) * 1000);

    // Return cleanup function
    return () => {
      clearTimeout(sessionTimeoutId);
      clearTimeout(modalTimeoutId);
    };
  }, [sessionTimeout, ...resetOnChange]);

  return (
    <>
      {showModal && (
        <LogoutWarningModal
          expiresOn={modalDisplaySecondsBeforeLogout * 1000 + Date.now()}
          onExtendSession={fetchSessionTimeout}
          logoutPath={logoutPath}
          renderModal={renderModal}
        />
      )}
    </>
  );
};

export default SessionTimeoutHandler;
