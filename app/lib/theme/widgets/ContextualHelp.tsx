import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tooltip from "@mui/material/Tooltip";

/**
 * @param {string} title - The title of the tooltip
 * @param {IconDefinition} icon - The icon to display in the tooltip; defaults to faExclamationCircle
 * @param {string} placement - The placement of the tooltip; defaults to "top"
 * @param {string} label - The label of the tooltip to be used as the aria-labelledby attribute; this gets passed by the parent component(FieldLabel)
 * @returns {ReactElement} - The tooltip component
 * To use this component, simply add "ui:tooltip" object to the uiSchema of the field you want to add a tooltip to.
 * Example:
 * "ui:tooltip": {
 *   "title": "This is the title of the tooltip",
 *   "icon": faExclamationCircle,
 *   "placement": "top"
 * }
 */

interface ContextualHelpProps {
  title: string;
  icon?: IconDefinition;
  placement?: "top" | "bottom" | "left" | "right";
  label: string;
}

const ContextualHelp: React.FC<ContextualHelpProps> = ({
  title,
  icon = faExclamationCircle,
  placement = "top",
  label,
}) => {
  // generate a unique id for the tooltip based on the label
  const tooltipId = `${label.replace(/\s+/g, "-").toLowerCase()}-tooltip`;
  return (
    <>
      <Tooltip
        title={title}
        arrow
        placement={placement}
        role="tooltip"
        id={tooltipId}
        tabIndex={0}
        className="tooltip"
      >
        <span aria-labelledby={tooltipId}>
          <FontAwesomeIcon icon={icon} name="tooltip" color="#767676" />
        </span>
      </Tooltip>
      <style jsx>{`
        .tooltip {
          cursor: pointer;
        }
      `}</style>
    </>
  );
};

export default ContextualHelp;
