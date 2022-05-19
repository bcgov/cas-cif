import { useRouter } from "next/router";
import {
  getProjectRevisionAnnualReportsFormPageRoute,
  getProjectRevisionContactsFormPageRoute,
  getProjectRevisionManagersFormPageRoute,
  getProjectRevisionOverviewFormPageRoute,
  getProjectRevisionPageRoute,
  getProjectRevisionQuarterlyReportsFormPageRoute,
} from "pageRoutes";
import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import { TaskList_projectRevision$key } from "__generated__/TaskList_projectRevision.graphql";
import TaskListItem from "./TaskListItem";
import TaskListSection from "./TaskListSection";
import { TaskListMode } from "./types";

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
    quarterlyReportsStatus,
    annualReportsStatus,
  } = useFragment(
    // The JSON string is tripping up eslint
    // eslint-disable-next-line relay/graphql-syntax
    graphql`
      fragment TaskList_projectRevision on ProjectRevision {
        id
        changeStatus
        projectByProjectId {
          proposalReference
        }
        projectOverviewStatus: tasklistStatusFor(formDataTableName: "project")
        projectContactsStatus: tasklistStatusFor(
          formDataTableName: "project_contact"
        )
        projectManagersStatus: tasklistStatusFor(
          formDataTableName: "project_manager"
        )
        quarterlyReportsStatus: tasklistStatusFor(
          formDataTableName: "reporting_requirement"
          jsonMatcher: "{\"reportType\":\"Quarterly\"}"
        )
        annualReportsStatus: tasklistStatusFor(
          formDataTableName: "reporting_requirement"
          jsonMatcher: "{\"reportType\":\"Annual\"}"
        )
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
        {/* Project Overview Section */}
        <TaskListSection
          defaultExpandedState={currentStep === "overview"}
          listItemNumber="1"
          listItemName="Project Overview"
        >
          <TaskListItem
            stepName="overview"
            linkUrl={getProjectRevisionOverviewFormPageRoute(id)}
            formTitle="Project overview"
            formStatus={projectOverviewStatus}
            currentStep={currentStep}
            mode={mode as TaskListMode}
          />
        </TaskListSection>

        {/* Project Details Section */}
        <TaskListSection
          defaultExpandedState={
            currentStep === "contacts" || currentStep === "managers"
          }
          listItemNumber="2"
          listItemName="Project Details"
          listItemMode={mode === "update" ? "" : "(optional)"}
        >
          <TaskListItem
            stepName="managers"
            linkUrl={getProjectRevisionManagersFormPageRoute(id)}
            formTitle="Project managers"
            formStatus={projectManagersStatus}
            currentStep={currentStep}
            mode={mode as TaskListMode}
          />
          <TaskListItem
            stepName="contacts"
            linkUrl={getProjectRevisionContactsFormPageRoute(id)}
            formTitle="Project contacts"
            formStatus={projectContactsStatus}
            currentStep={currentStep}
            mode={mode as TaskListMode}
          />
        </TaskListSection>

        {/* Quarterly Reports Section */}
        <TaskListSection
          defaultExpandedState={currentStep === "quarterly-reports"}
          listItemNumber="3"
          listItemName="Quarterly Reports"
        >
          <TaskListItem
            stepName="quarterly-reports"
            linkUrl={getProjectRevisionQuarterlyReportsFormPageRoute(id)}
            formTitle="Quarterly reports"
            formStatus={quarterlyReportsStatus}
            currentStep={currentStep}
            mode={mode as TaskListMode}
          />
        </TaskListSection>

        {/* Annual Reports Section */}
        <TaskListSection
          defaultExpandedState={currentStep === "annual-reports"}
          listItemNumber="4"
          listItemName="Annual Reports"
        >
          <TaskListItem
            stepName="annual-reports"
            linkUrl={getProjectRevisionAnnualReportsFormPageRoute(id)}
            formTitle="Annual reports"
            formStatus={annualReportsStatus}
            currentStep={currentStep}
            mode={mode as TaskListMode}
          />
        </TaskListSection>

        {/* Project Summary Section */}
        {mode !== "view" && (
          <TaskListSection
            defaultExpandedState={currentStep === "summary"}
            listItemNumber="5"
            listItemName="Submit changes"
          >
            <TaskListItem
              stepName="summary"
              linkUrl={getProjectRevisionPageRoute(id)}
              formTitle="Review and submit information"
              formStatus={null}
              currentStep={currentStep}
              mode={mode as TaskListMode}
            />
          </TaskListSection>
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
