import getConfig from "next/config";
import Navigation from "components/Layout/Navigation";
import Footer from "components/Layout/Footer";
import SiteNoticeBanner from "components/Layout/SiteNoticeBanner";

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
        title={title}
        hideLoginButton={true}
        alwaysShowSubheader={showSubheader}
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
            background-color: #fafafc;
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
