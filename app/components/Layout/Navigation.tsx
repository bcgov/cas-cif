import Image from "next/legacy/image";
import { BaseNavigation } from "@button-inc/bcgov-theme/Navigation";
import { BaseHeader } from "@button-inc/bcgov-theme/Header";
import LogoutForm from "components/Session/LogoutForm";
import SubHeader from "./SubHeader";
import { useRouter } from "next/router";

import LoginForm from "components/Session/LoginForm";
import useShowGrowthbookFeature from "lib/growthbookWrapper";

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
  links,
}) => {
  // Growthbook - external-operators
  const showExternalOperatorsLogin =
    useShowGrowthbookFeature("external-operators");

  const router = useRouter();

  let rightSide = isLoggedIn ? (
    <>
      {userProfileComponent}
      <LogoutForm />
    </>
  ) : (
    router.pathname !== "/" &&
    !router.pathname.includes("/500") && (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "1.25em",
        }}
      >
        <LoginForm />
        {showExternalOperatorsLogin && <LoginForm isExternal={true} />}
      </div>
    )
  );

  const unauthorizedIdir = title === "Access required";

  return (
    <>
      <BaseNavigation>
        <BaseHeader>
          <BaseHeader.Group className="banner">
            {/*
              We don't want a front end navigation here,
              to ensure that a back-end redirect is performed when clicking on the banner image
            */}
            <a
              href={
                !isLoggedIn
                  ? "/"
                  : router.pathname.includes("/cif-external")
                  ? "/cif-external"
                  : "/cif"
              }
            >
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
        {((isLoggedIn && !unauthorizedIdir) || alwaysShowSubheader) && (
          <SubHeader links={links} />
        )}
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
