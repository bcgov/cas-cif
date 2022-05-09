import { useRouter } from "next/router";
import {
  getProjectRevisionContactsFormPageRoute,
  getProjectRevisionManagersFormPageRoute,
  getProjectRevisionOverviewFormPageRoute,
  getProjectRevisionPageRoute,
} from "pageRoutes";
import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import { TaskList_projectRevision$key } from "__generated__/TaskList_projectRevision.graphql";
import TaskListItem from "./TaskListItem";

interface Props {
  projectRevision: TaskList_projectRevision$key;
}

const TaskList: React.FC<Props> = ({ projectRevision }) => {
  const {
    id,
    projectByProjectId,
    changeStatus,
    projectOverviewStatus,
    projectManagersStatus,
    projectContactsStatus,
  } = useFragment(
    graphql`
      fragment TaskList_projectRevision on ProjectRevision {
        id
        changeStatus
        projectByProjectId {
          proposalReference
        }
        projectOverviewStatus
        projectContactsStatus
        projectManagersStatus
      }
    `,
    projectRevision
  );
  const router = useRouter();

  let mode =
    changeStatus === "committed"
      ? "view"
      : projectByProjectId
      ? "update"
      : "create";

  const currentStep = useMemo(() => {
    if (!router || !router.pathname) return null;
    if (`${router.pathname}/` === getProjectRevisionPageRoute(id).pathname)
      return "summary";
    const routeParts = router.pathname.split("/");
    return routeParts[routeParts.length - 1];
  }, [id, router]);

  return (
    <div className="container">
      <h2>
        {mode === "view"
          ? projectByProjectId.proposalReference
          : mode === "update"
          ? "Editing: " + projectByProjectId.proposalReference
          : "Add a Project"}
      </h2>
      <ol>
        <TaskListItem
          defaultExpandedState={currentStep === "overview"}
          listItemNumber="1"
          listItemName="Project Overview"
          formListItemArray={[
            {
              stepName: "overview",
              linkUrl: getProjectRevisionOverviewFormPageRoute(id),
              formTitle: "Project overview",
              formStatus: projectOverviewStatus,
            },
          ]}
          currentStep={currentStep}
          mode={mode}
        />
        <TaskListItem
          defaultExpandedState={
            currentStep === "contacts" || currentStep === "managers"
          }
          listItemNumber="2"
          listItemName="Project Details"
          listItemMode={mode === "update" ? "" : "(optional)"}
          formListItemArray={[
            {
              stepName: "managers",
              linkUrl: getProjectRevisionManagersFormPageRoute(id),
              formTitle: "Project managers",
              formStatus: projectManagersStatus,
            },
            {
              stepName: "contacts",
              linkUrl: getProjectRevisionContactsFormPageRoute(id),
              formTitle: "Project contacts",
              formStatus: projectContactsStatus,
            },
          ]}
          currentStep={currentStep}
          mode={mode}
        />
        {mode !== "view" && (
          <TaskListItem
            defaultExpandedState={currentStep === "summary"}
            listItemNumber="3"
            listItemName="Submit changes"
            formListItemArray={[
              {
                stepName: "summary",
                linkUrl: getProjectRevisionPageRoute(id),
                formTitle: "Review and submit information",
                formStatus: null,
              },
            ]}
            currentStep={currentStep}
            mode={mode}
          />
        )}
      </ol>
      <style jsx>{`
        ol {
          list-style: none;
          margin: 0;
        }

        h2 {
          font-size: 1.25rem;
          margin: 0;
          padding: 20px 0 10px 0;
          border-bottom: 1px solid #d1d1d1;
          text-indent: 15px;
        }

        div :global(a) {
          color: #1a5a96;
        }

        div :global(a:hover) {
          text-decoration: none;
          color: blue;
        }

        div.container {
          background-color: #e5e5e5;
          width: 400px;
        }
      `}</style>
    </div>
  );
};

export default TaskList;
