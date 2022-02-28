import { graphql, useFragment } from "react-relay";
import type { DefaultLayout_session$key } from "DefaultLayout_session.graphql";
import getConfig from "next/config";
import Navigation from "components/Layout/Navigation";
import Footer from "components/Layout/Footer";
import SiteNoticeBanner from "components/Layout/SiteNoticeBanner";
import UserProfile from "components/User/UserProfile";

const runtimeConfig = getConfig()?.publicRuntimeConfig ?? {};

interface Props {
  title?: string;
  session: DefaultLayout_session$key;
}

const DefaultLayout: React.FC<Props> = ({
  children,
  title,
  session: sessionFragment,
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

  return (
    <div id="page-wrap">
      <Navigation
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
      <main>{children}</main>
      <Footer />
      <style jsx>
        {`
          #page-wrap {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          main {
            padding: 30px 40px;
            flex-grow: 1;
            background-color: #fafafc;
            margin: auto;
          }
        `}
      </style>
    </div>
  );
};

export default DefaultLayout;
