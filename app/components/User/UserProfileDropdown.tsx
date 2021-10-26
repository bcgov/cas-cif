import React, { useState } from "react";
import { graphql, useFragment } from "react-relay";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import type { UserProfileDropdown_user$key } from "__generated__/UserProfileDropdown_user.graphql";
import Button from "@button-inc/bcgov-theme/Button";

interface Props {
  user: UserProfileDropdown_user$key;
}

// Bootstrap's Dropdown.Item component doesn't naturally tab and submit the Form item.
const submitForm = (e) => {
  if (e.key === "Enter" || e.which === 13) {
    e.currentTarget.submit();
  }
};

const UserProfileDropdown: React.FC<Props> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { firstName, lastName, emailAddress } =
    useFragment(
      graphql`
        fragment UserProfileDropdown_user on CifUser {
          firstName
          lastName
          emailAddress
        }
      `,
      user
    ) || {};

  return (
    <>
      <Button
        id="user-icon"
        variant="primary"
        aria-label="User menu toggle"
        style={{
          borderRadius: "50%",
          width: 40,
          height: 40,
          border: "none",
          background: "#fff",
          position: "relative",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <FontAwesomeIcon
          color="#036"
          icon={faUser}
          style={{
            fontSize: "30px",
            verticalAlign: "middle",
            height: "0.8em",
            paddingBottom: "2px",
          }}
        />
      </Button>
      {isOpen && (
        <div>
          <Link href="/user/profile">
            <a className="dropdown-item text-right">
              <div>
                <span>{firstName}</span> <span>{lastName}</span>
              </div>
              <div className="small text-muted">{emailAddress}</div>
            </a>
          </Link>
          <form
            action="/logout"
            method="post"
            tabIndex={0}
            onKeyPress={submitForm}
          >
            {" "}
            <button type="submit" className="w-100 text-right">
              Logout
            </button>
          </form>
        </div>
      )}
      <style jsx>{`
        #user-icon.dropdown-toggle::after {
          position: absolute;
          right: -14px;
          top: 46%;
          color: #fff;
        }
      `}</style>
    </>
  );
};

export default UserProfileDropdown;
