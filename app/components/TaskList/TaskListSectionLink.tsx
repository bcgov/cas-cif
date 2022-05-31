import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import Link from "next/link";

interface Props {
  icon: IconDefinition;
  title: string;
  linkUrl: { pathname: string; query: { projectRevision: string } };
  currentStep: string;
  stepName: string;
}

const TaskListSectionLink: React.FC<Props> = ({
  icon,
  title,
  linkUrl,
  currentStep,
  stepName,
}) => {
  return (
    <li aria-current={currentStep === stepName ? "step" : false}>
      <Link href={linkUrl} passHref>
        <h3>
          <span className="link">
            {title} <FontAwesomeIcon icon={icon} />
          </span>
        </h3>
      </Link>
      <style jsx>{`
        li {
          margin-bottom: 0;
          cursor: pointer;
        }
        li[aria-current="step"],
        li[aria-current="step"] div {
          background-color: #fafafc;
        }
        h3 {
          font-size: 1rem;
          line-height: 1;
          border-bottom: 1px solid #d1d1d1;
          padding: 10px 0 10px 0.5em;
          margin: 0;
          display: flex;
          justify-content: space-between;
        }
        h3,
        ul {
          list-style: none;
          margin: 0;
        }
      `}</style>
    </li>
  );
};

export default TaskListSectionLink;
