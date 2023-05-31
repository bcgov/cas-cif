import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tooltip from "@mui/material/Tooltip";
import { BC_GOV_LINKS_COLOR, DARK_GREY_BG_COLOR } from "../colors";
import parse from "html-react-parser";

/**
 * @param {string} text - The text of the tooltip to be displayed (can be HTML)
 * @param {IconDefinition} icon - The icon to display in the tooltip; defaults to faExclamationCircle
 * @param {string} placement - The placement of the tooltip; defaults to "top"
 * @param {string} label - The label of the tooltip to be used as the aria-labelledby attribute; this gets passed by the parent component(FieldLabel)
 * @returns {ReactElement} - The tooltip component
 * To use this component, simply add "ui:tooltip" object to the uiSchema of the field you want to add a tooltip to.
 * Example:
 * "ui:tooltip": {
 *   "text": "<div>Some content here with <a>Links</a> and other HTML tags</div>",
 *   "icon": faExclamationCircle,
 *   "placement": "top"
 * }
 * NOTE: we are using html-react-parser package to parse the text of the tooltip to allow for HTML tags and avoid using dangerouslySetInnerHTML
 */

interface ContextualHelpProps {
  text: string;
  icon?: IconDefinition;
  placement?:
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "bottom-end"
    | "bottom-start"
    | "left-end"
    | "left-start"
    | "right-end"
    | "right-start"
    | "top-end"
    | "top-start";
  label: string;
}

const ContextualHelp: React.FC<ContextualHelpProps> = ({
  text,
  icon = faExclamationCircle,
  placement = "bottom",
  label,
}) => {
  // generate a unique id for the tooltip based on the label
  const tooltipId = `${label.replace(/\s+/g, "-").toLowerCase()}-tooltip`;
  return (
    <>
      <Tooltip
        title={parse(text)}
        arrow
        placement={placement}
        role="tooltip"
        id={tooltipId}
        tabIndex={0}
        className="tooltip"
        aria-label={tooltipId}
      >
        <span>
          <FontAwesomeIcon
            icon={icon}
            name="tooltip"
            color={BC_GOV_LINKS_COLOR}
          />
        </span>
      </Tooltip>
      <style jsx>{`
        .tooltip {
          cursor: pointer;
        }
        :global(.MuiTooltip-tooltip) {
          background-color: ${DARK_GREY_BG_COLOR};
          box-shadow: 5px 5px 5px #888888;
          color: black;
        }
        :global(.MuiTooltip-tooltip .MuiTooltip-arrow) {
          color: ${DARK_GREY_BG_COLOR};
        }
        :global(.MuiTooltip-tooltip a) {
          color: ${BC_GOV_LINKS_COLOR};
        }
      `}</style>
    </>
  );
};

export default ContextualHelp;
