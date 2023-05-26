import React from "react";
import { Alert } from "@button-inc/bcgov-theme";
import { BC_GOV_LINKS_COLOR } from "./colors";

interface Props {
  onProceed: () => void;
  onCancel: () => void;
  alertText: string;
}
const ConfirmationAlert: React.FC<Props> = ({
  onProceed,
  onCancel,
  alertText,
}) => {
  return (
    <div>
      <Alert variant="danger" size="sm">
        {alertText}
        <a onClick={onProceed} id="confirm-discard-revision">
          Proceed
        </a>
        <a onClick={onCancel}>Cancel</a>
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
            color: ${BC_GOV_LINKS_COLOR};
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

export default ConfirmationAlert;
