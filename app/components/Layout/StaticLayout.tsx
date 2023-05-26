import getConfig from "next/config";
import Navigation from "components/Layout/Navigation";
import Footer from "components/Layout/Footer";
import SiteNoticeBanner from "components/Layout/SiteNoticeBanner";
import footerLinks from "data/dashboardLinks/footerLinks";
import subHeaderLinks from "data/dashboardLinks/subHeaderLinks";
import { MAIN_BG_COLOR } from "lib/theme/colors";

const runtimeConfig = getConfig()?.publicRuntimeConfig ?? {};

interface Props {
  title?: string;
  showSubheader?: boolean;
}

const StaticLayout: React.FC<Props> = ({
  children,
  title,
  showSubheader = false,
}) => {
  return (
    <div id="page-wrap">
      <Navigation
        links={subHeaderLinks}
        title={title}
        hideLoginButton={true}
        alwaysShowSubheader={showSubheader}
      >
        {runtimeConfig.SITEWIDE_NOTICE && (
          <SiteNoticeBanner content={runtimeConfig.SITEWIDE_NOTICE} />
        )}
      </Navigation>
      <main>{children}</main>
      <Footer links={footerLinks} />
      <style jsx>
        {`
          #page-wrap {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            background-color: ${MAIN_BG_COLOR};
          }
          main {
            padding: 30px 40px;
            flex-grow: 1;
            margin: auto;
          }
        `}
      </style>
    </div>
  );
};

export default StaticLayout;
