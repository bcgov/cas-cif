import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import { useStageDirtyFormChanges } from "mutations/FormChange/stageDirtyFormChanges";
import {
  getProjectRevisionPageRoute,
  getProjectRevisionFormPageRoute,
  getProjectRevisionAttachmentsPageRoute,
} from "pageRoutes";
import { useMemo, useEffect } from "react";
import { graphql, useFragment } from "react-relay";
import { TaskList_projectRevision$key } from "__generated__/TaskList_projectRevision.graphql";
import AttachmentsTaskListSection from "./AttachmentsTaskListSection";
import TaskListItem from "./TaskListItem";
import TaskListSection from "./TaskListSection";
import { TaskListMode } from "./types";
import { ATTENTION_REQUIRED_STATUS } from "./TaskListStatus";

interface Props {
  projectRevision: TaskList_projectRevision$key;
  mode: TaskListMode;
}

const TaskList: React.FC<Props> = ({ projectRevision, mode }) => {
  const {
    id,
    rowId,
    projectByProjectId,
    projectOverviewStatus,
    projectManagersStatus,
    projectContactsStatus,
    quarterlyReportsStatus,
    annualReportsStatus,
    milestoneReportStatuses,
  } = useFragment(
    // The JSON string is tripping up eslint
    // eslint-disable-next-line relay/graphql-syntax
    graphql`
      fragment TaskList_projectRevision on ProjectRevision {
        id
        rowId
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
        milestoneReportStatuses {
          edges {
            node {
              milestoneIndex
              reportingRequirementStatus
              formCompletionStatus
            }
          }
        }
      }
    `,
    projectRevision
  );
  const router = useRouter();

  const [stageDirtyFormChanges] = useStageDirtyFormChanges();
  useEffect(() => {
    if (mode !== "view")
      stageDirtyFormChanges({
        variables: {
          input: {
            projectRevisionId: rowId,
          },
        },
      });
    // We only want to run this effect on mount, so we use an empty array as a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, mode]);

  const currentStep = useMemo(() => {
    if (!router || !router.pathname) return null;
    return (router.query.formIndex as string) ?? "summary";
  }, [router]);

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
          defaultExpandedState={
            currentStep === "0" ||
            projectOverviewStatus === ATTENTION_REQUIRED_STATUS
          }
          listItemNumber="1"
          listItemName="Project Overview"
        >
          <TaskListItem
            stepName="0"
            linkUrl={getProjectRevisionFormPageRoute(id, 0)}
            formTitle="Project overview"
            formStatus={projectOverviewStatus}
            currentStep={currentStep}
            mode={mode}
          />
        </TaskListSection>

        {/* Project Details Section */}
        <TaskListSection
          defaultExpandedState={
            currentStep === "1" ||
            currentStep === "2" ||
            projectManagersStatus === ATTENTION_REQUIRED_STATUS ||
            projectContactsStatus === ATTENTION_REQUIRED_STATUS
          }
          listItemNumber="2"
          listItemName="Project Details"
          listItemMode={mode === "update" ? "" : "(optional)"}
        >
          <TaskListItem
            stepName="1"
            linkUrl={getProjectRevisionFormPageRoute(id, 1)}
            formTitle="Project managers"
            formStatus={projectManagersStatus}
            currentStep={currentStep}
            mode={mode}
          />
          <TaskListItem
            stepName="2"
            linkUrl={getProjectRevisionFormPageRoute(id, 2)}
            formTitle="Project contacts"
            formStatus={projectContactsStatus}
            currentStep={currentStep}
            mode={mode}
          />
        </TaskListSection>

        {/* Milestone Reports Section */}
        <TaskListSection
          defaultExpandedState={currentStep === "3"}
          listItemNumber="3"
          listItemName="Milestone Reports"
        >
          {milestoneReportStatuses.edges.length === 1 ? (
            <TaskListItem
              stepName="3"
              linkUrl={getProjectRevisionFormPageRoute(id, 3)}
              formTitle="Milestone reports"
              formStatus={null} // Leaving this status as null for now while we decide how to display milestone statuses
              currentStep={currentStep}
              mode={mode}
            />
          ) : (
            milestoneReportStatuses.edges.map(({ node }) => (
              <TaskListItem
                key={node.milestoneIndex}
                stepName="3"
                linkUrl={getProjectRevisionFormPageRoute(id, 3)}
                formTitle={
                  node.milestoneIndex === -1
                    ? "Status of milestone reporting"
                    : `Milestone ${node.milestoneIndex}`
                }
                reportingRequirementStatus={node.reportingRequirementStatus}
                formStatus={node.formCompletionStatus} // Leaving this status as null for now while we decide how to display milestone statuses
                currentStep={currentStep}
                mode={mode}
              />
            ))
          )}
        </TaskListSection>

        {/* Quarterly Reports Section */}
        <TaskListSection
          defaultExpandedState={
            currentStep === "4" ||
            quarterlyReportsStatus === ATTENTION_REQUIRED_STATUS
          }
          listItemNumber="4"
          listItemName="Quarterly Reports"
        >
          <TaskListItem
            stepName="4"
            linkUrl={getProjectRevisionFormPageRoute(id, 4)}
            formTitle="Quarterly reports"
            formStatus={quarterlyReportsStatus}
            currentStep={currentStep}
            mode={mode}
          />
        </TaskListSection>

        {/* Annual Reports Section */}
        <TaskListSection
          defaultExpandedState={
            currentStep === "5" ||
            annualReportsStatus === ATTENTION_REQUIRED_STATUS
          }
          listItemNumber="5"
          listItemName="Annual Reports"
        >
          <TaskListItem
            stepName="5"
            linkUrl={getProjectRevisionFormPageRoute(id, 5)}
            formTitle="Annual reports"
            formStatus={annualReportsStatus}
            currentStep={currentStep}
            mode={mode}
          />
        </TaskListSection>

        {/* Project Summary Section */}
        {mode !== "view" && (
          <TaskListSection
            defaultExpandedState={currentStep === "summary"}
            listItemNumber="6"
            listItemName="Submit changes"
          >
            <TaskListItem
              stepName="summary"
              linkUrl={getProjectRevisionPageRoute(id)}
              formTitle="Review and submit information"
              formStatus={null}
              currentStep={currentStep}
              mode={mode}
            />
          </TaskListSection>
        )}

        {/* Attachments Section */}
        {mode === "view" && (
          <AttachmentsTaskListSection
            icon={faPaperclip}
            title="Attachments"
            linkUrl={getProjectRevisionAttachmentsPageRoute(id)}
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
