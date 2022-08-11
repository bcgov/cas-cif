import React from "react";
import { Alert } from "@button-inc/bcgov-theme";

const DangerAlert: React.FC<{ proceedOnClick; cancelOnClick }> = ({
  proceedOnClick,
  cancelOnClick,
}) => {
  return (
    <div>
      <Alert variant="danger" size="sm">
        All changes made will be deleted.
        <a onClick={proceedOnClick} id="confirm-discard-revision">
          Proceed
        </a>
        <a onClick={cancelOnClick}>Cancel</a>
      </Alert>
      <style jsx>
        {`
          div :global(#discard-project-icon) {
            color: #323a45;
            margin-right: 0.5em;
          }
          div :global(#discard-project-button) {
            margin-bottom: 1em;
            color: #cd2026;
          }
          div :global(#discard-project-button:hover) {
            background-color: #aeb0b5;
          }
          div :global(.pg-notification) {
            margin-bottom: 1em;
            margin-top: 1em;
          }
          div :global(a) {
            color: #1a5a96;
          }
          div :global(a:hover) {
            text-decoration: none;
            color: blue;
            cursor: pointer;
          }
          div :global(#confirm-discard-revision) {
            margin-left: 2em;
            margin-right: 1em;
          }
        `}
      </style>
    </div>
  );
};

export default DangerAlert;
