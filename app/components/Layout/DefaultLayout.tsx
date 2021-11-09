import React from "react";
import Grid from "@button-inc/bcgov-theme/Grid";
import { graphql, useFragment } from "react-relay";
import type { DefaultLayout_session$key } from "DefaultLayout_session.graphql";
import getConfig from "next/config";
import Navigation from "components/Layout/Navigation";
import Footer from "components/Layout/Footer";
import SiteNoticeBanner from "components/Layout/SiteNoticeBanner";
import UserProfileDropdown from "components/User/UserProfileDropdown";

const runtimeConfig = getConfig()?.publicRuntimeConfig ?? {};

interface Props {
  title?: string;
  session: DefaultLayout_session$key;
  width?: "narrow" | "wide";
}

const DefaultLayout: React.FC<Props> = ({
  children,
  title,
  session: sessionFragment,
  width = "narrow",
}) => {
  const session = useFragment(
    graphql`
      fragment DefaultLayout_session on KeycloakJwt {
        cifUserBySub {
          ...UserProfileDropdown_user
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
        userProfileDropdown={
          <UserProfileDropdown user={session ? session.cifUserBySub : null} />
        }
      >
        {runtimeConfig.SITEWIDE_NOTICE && (
          <SiteNoticeBanner content={runtimeConfig.SITEWIDE_NOTICE} />
        )}
      </Navigation>
      <main>
        <div id="page-content">
          <Grid cols={12} className={width}>
            <Grid.Row justify="center" gutter={[0, 50]}>
              <Grid.Col span={7}>{children}</Grid.Col>
            </Grid.Row>
          </Grid>
        </div>
      </main>
      <Footer />
      <style jsx>
        {`
          #page-wrap {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }

          main {
            flex-grow: 1;
          }
        `}
      </style>
    </div>
  );
};

export default DefaultLayout;
