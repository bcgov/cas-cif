import { graphql, useFragment } from "react-relay";
import type { DefaultLayout_session$key } from "DefaultLayout_session.graphql";
import getConfig from "next/config";
import Navigation from "components/Layout/Navigation";
import Footer from "components/Layout/Footer";
import SiteNoticeBanner from "components/Layout/SiteNoticeBanner";
import UserProfile from "components/User/UserProfile";
import GlobalAlert from "./GlobalAlert";
import { useContext } from "react";
import { ErrorContext } from "contexts/ErrorContext";
import footerLinks from "data/dashboardLinks/footerLinks";
import subHeaderLinks from "data/dashboardLinks/subHeaderLinks";
import { LIGHT_GREY_BG_COLOR } from "lib/theme/colors";

const runtimeConfig = getConfig()?.publicRuntimeConfig ?? {};

interface Props {
  title?: string;
  session: DefaultLayout_session$key;
  leftSideNav?: React.ReactNode;
}

const DefaultLayout: React.FC<Props> = ({
  children,
  title,
  session: sessionFragment,
  leftSideNav,
}) => {
  const session = useFragment(
    graphql`
      fragment DefaultLayout_session on KeycloakJwt {
        cifUserBySub {
          ...UserProfile_user
        }
      }
    `,
    sessionFragment
  );

  const { error } = useContext(ErrorContext);

  return (
    <div id="page-wrap">
      <Navigation
        links={subHeaderLinks}
        isLoggedIn={Boolean(session)}
        title={title}
        userProfileComponent={
          <UserProfile user={session ? session.cifUserBySub : null} />
        }
      >
        {runtimeConfig.SITEWIDE_NOTICE && (
          <SiteNoticeBanner content={runtimeConfig.SITEWIDE_NOTICE} />
        )}
      </Navigation>
      {error && <GlobalAlert error={error} />}
      <div id="page-content">
        {leftSideNav && <nav aria-label="side navigation">{leftSideNav}</nav>}
        <main>{children}</main>
      </div>
      <Footer links={footerLinks} />
      <style jsx>
        {`
          #page-wrap {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            background-color: ${LIGHT_GREY_BG_COLOR};
          }

          #page-content {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
            margin: auto;
            margin-top: 0;
          }

          main,
          nav {
            padding: 30px 40px;
            flex-grow: 1;
          }

          main {
            width: 100vw;
          }

          @media (min-width: 1024px) {
            #page-content {
              flex-direction: row;
            }

            nav {
              position: sticky;
              top: 30px;
              padding-right: 0;
            }

            main {
              min-width: 700px;
              width: 100%;
            }
          }
        `}
      </style>
    </div>
  );
};

export default DefaultLayout;
