import TaskListStatus from "./TaskListStatus";
import BCGovLink from "@button-inc/bcgov-theme/Link";
import Link from "next/link";
import { TaskListLinkUrl, TaskListMode } from "./types";
import { MAIN_BG_COLOR } from "lib/theme/colors";

interface Props {
  stepName: string;
  linkUrl?: TaskListLinkUrl;
  formTitle: string;
  formStatus: string;
  currentStep: string;
  mode: TaskListMode;
  hasAnchor?: boolean;
  milestoneDueDate?: string;
}

const TaskListItem: React.FC<Props> = ({
  stepName,
  linkUrl = undefined,
  formTitle,
  formStatus,
  currentStep,
  mode,
  hasAnchor,
  milestoneDueDate,
}) => {
  return (
    <li
      aria-current={currentStep === stepName ? "step" : false}
      className="bordered"
    >
      {linkUrl ? (
        <Link passHref href={linkUrl} scroll={!hasAnchor} legacyBehavior>
          <BCGovLink>
            {mode === "view" || stepName === "summary"
              ? formTitle
              : `${
                  mode === "update" || hasAnchor ? "Edit" : "Add"
                } ${formTitle}`}
          </BCGovLink>
        </Link>
      ) : (
        formTitle
      )}
      {mode !== "view" && <TaskListStatus formStatus={formStatus} />}
      {mode === "view" && milestoneDueDate && (
        <TaskListStatus formStatus={milestoneDueDate} />
      )}

      <style jsx>{`
        li {
          margin-bottom: 0;
          display: flex;
          justify-content: space-between;
        }
        li[aria-current="step"],
        li[aria-current="step"] div {
          background-color: ${MAIN_BG_COLOR};
          padding-left: 15px;
        }
        .bordered {
          border-bottom: 1px solid #d1d1d1;
          padding: 10px 0 10px 15px;
        }
      `}</style>
    </li>
  );
};

export default TaskListItem;
