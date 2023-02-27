import Image from "next/legacy/image";
import { BaseNavigation } from "@button-inc/bcgov-theme/Navigation";
import { BaseHeader } from "@button-inc/bcgov-theme/Header";
import LoginForm from "components/Session/LoginForm";
import LogoutForm from "components/Session/LogoutForm";

import SubHeader from "./SubHeader";

interface Props {
  isLoggedIn?: boolean;
  alwaysShowSubheader?: boolean;
  isAdmin?: boolean;
  children?: React.ReactNode;
  title?: string;
  userProfileComponent?: React.ReactNode;
  hideLoginButton?: boolean;
  links: { name: string; href: { pathname: string }; highlightOn: string[] }[];
}

const DEFAULT_MOBILE_BREAK_POINT = "900";

const Navigation: React.FC<Props> = ({
  isLoggedIn = false,
  alwaysShowSubheader = false,
  title = "CleanBC Industry Fund",
  userProfileComponent,
  hideLoginButton,
  links,
}) => {
  let rightSide = isLoggedIn ? (
    <>
      {userProfileComponent}
      <LogoutForm />
    </>
  ) : hideLoginButton ? (
    <></>
  ) : (
    <LoginForm />
  );
  return (
    <>
      <BaseNavigation>
        <BaseHeader>
          <BaseHeader.Group className="banner">
            {/*
              We don't want a front end navigation here,
              to ensure that a back-end redirect is performed when clicking on the banner image
            */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages*/}
            <a href="/">
              <Image
                priority
                src="/img/BCID_CleanBC_rev_tagline_colour.svg"
                alt="logo for Province of British Columbia CleanBC"
                height={50}
                width={300}
              />
            </a>
          </BaseHeader.Group>
          <BaseHeader.Item collapse={DEFAULT_MOBILE_BREAK_POINT}>
            <h1>{title}</h1>
          </BaseHeader.Item>
          <BaseHeader.Group
            style={{
              marginLeft: "auto",
              marginBottom: "auto",
              marginTop: "auto",
            }}
          >
            {rightSide}
          </BaseHeader.Group>
        </BaseHeader>
        {(isLoggedIn || alwaysShowSubheader) && <SubHeader links={links} />}
      </BaseNavigation>
      <style jsx>{`
        h1 {
          font-weight: normal;
          margin-top: 10px;
        }
      `}</style>
    </>
  );
};

export default Navigation;
