import Image from "next/image";
import Button from "@button-inc/bcgov-theme/Button";
import { BaseNavigation } from "@button-inc/bcgov-theme/Navigation";
import { BaseHeader } from "@button-inc/bcgov-theme/Header";
import LoginForm from "components/LoginForm";
import SubHeader from "./SubHeader";

interface Props {
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  children?: React.ReactNode;
  title?: string;
  userProfileComponent?: React.ReactNode;
}

const DEFAULT_MOBILE_BREAK_POINT = "900";

const Navigation: React.FC<Props> = ({
  isLoggedIn = false,
  isAdmin = false,
  title = "CleanBC Industry Fund",
  userProfileComponent,
}) => {
  let rightSide = isLoggedIn ? (
    userProfileComponent
  ) : (
    <LoginForm>
      <Button variant="secondary-inverse" type="submit">
        Login
      </Button>
    </LoginForm>
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
        {isLoggedIn && <SubHeader isAdmin={isAdmin} />}
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
