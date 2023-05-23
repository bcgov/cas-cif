import { useRouter } from "next/router";
import { useStageDirtyFormChanges } from "mutations/FormChange/stageDirtyFormChanges";
import {
  getProjectRevisionPageRoute,
  getProjectRevisionViewPageRoute,
  getProjectRevisionCreatePageRoute,
  getProjectRevisionEditPageRoute,
} from "routes/pageRoutes";
import { useMemo, useEffect } from "react";
import { graphql, useFragment } from "react-relay";
import { TaskList_projectRevision$key } from "__generated__/TaskList_projectRevision.graphql";
import TaskListItem from "./TaskListItem";
import TaskListSection from "./TaskListSection";
import { TaskListMode, TaskListDynamicConfiguration } from "./types";
import { ATTENTION_REQUIRED_STATUS } from "./TaskListStatus";
import BaseTaskListItemComponent from "./TaskListItemComponents/BaseTaskListItemsComponent";
import MilestoneTaskListItemsComponent from "./TaskListItemComponents/MilestoneTaskListItemsComponent";
import { useNumberedFormStructure } from "data/formPages/formStructure";
import ProjectRevisionChangeLogsTaskListSection from "./ProjectRevisionChangeLogsTaskListSection";
import useShowGrowthbookFeature from "lib/growthbookWrapper";

interface Props {
  projectRevision: TaskList_projectRevision$key;
  mode: TaskListMode;
  projectRevisionUnderReview?: any;
}
const TaskList: React.FC<Props> = ({
  projectRevision,
  mode,
  projectRevisionUnderReview,
}) => {
  const {
    id,
    rowId,
    revisionType,
    typeRowNumber,
    projectFormChange,
    projectByProjectId,
    projectOverviewStatus,
    projectManagersStatus,
    projectContactsStatus,
    quarterlyReportsStatus,
    annualReportsStatus,
    milestoneReportStatuses,
    fundingAgreementStatus,
    teimpStatus,
    projectSummaryReportStatus,
    projectAttachmentsStatus,
  } = useFragment(
    // The JSON string is tripping up eslint
    // eslint-disable-next-line relay/graphql-syntax
    graphql`
      fragment TaskList_projectRevision on ProjectRevision {
        id
        rowId
        changeStatus
        revisionType
        typeRowNumber
        projectFormChange {
          asProject {
            fundingStreamRfpByFundingStreamRfpId {
              fundingStreamByFundingStreamId {
                name
              }
            }
          }
        }
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
        teimpStatus: tasklistStatusFor(
          formDataTableName: "emission_intensity_report"
        )
        fundingAgreementStatus: tasklistStatusFor(formDataTableName: "funding_parameter")
        milestoneReportStatuses {
          edges {
            node {
              milestoneIndex
              reportDueDate
              submittedDate
              status: formCompletionStatus
            }
          }
        }
        projectSummaryReportStatus: tasklistStatusFor(
          formDataTableName: "reporting_requirement"
          jsonMatcher: "{\"reportType\":\"Project Summary Report\"}"
        )
        projectAttachmentsStatus: tasklistStatusFor(
          formDataTableName: "project_attachment"
        )
      }
    `,
    projectRevision
  );
  const router = useRouter();

  const [stageDirtyFormChanges] = useStageDirtyFormChanges();
  useEffect(() => {
    if (mode !== "view" && !router.query?.isRoutedFromNew)
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

  const fundingStream =
    projectFormChange.asProject.fundingStreamRfpByFundingStreamRfpId
      .fundingStreamByFundingStreamId.name;
  const numberedFormStructure = useNumberedFormStructure(fundingStream);

  const tasklistRenderingConfiguration: TaskListDynamicConfiguration = {
    projectOverview: {
      context: [{ status: projectOverviewStatus }],
      ItemsComponent: BaseTaskListItemComponent,
    },
    projectManagers: {
      context: [{ status: projectManagersStatus }],
      ItemsComponent: BaseTaskListItemComponent,
    },
    projectContacts: {
      context: [{ status: projectContactsStatus }],
      ItemsComponent: BaseTaskListItemComponent,
    },
    quarterlyReports: {
      context: [{ status: quarterlyReportsStatus }],
      ItemsComponent: BaseTaskListItemComponent,
    },
    annualReports: {
      context: [{ status: annualReportsStatus }],
      ItemsComponent: BaseTaskListItemComponent,
    },
    projectMilestones: {
      context: milestoneReportStatuses.edges.map((edge) => edge.node),
      ItemsComponent: MilestoneTaskListItemsComponent,
    },
    fundingAgreement: {
      context: [{ status: fundingAgreementStatus }],
      ItemsComponent: BaseTaskListItemComponent,
    },
    teimp: {
      context: [{ status: teimpStatus }],
      ItemsComponent: BaseTaskListItemComponent,
    },
    projectSummaryReport: {
      context: [{ status: projectSummaryReportStatus }],
      ItemsComponent: BaseTaskListItemComponent,
    },
    projectAttachments: {
      context: [{ status: projectAttachmentsStatus }],
      ItemsComponent: BaseTaskListItemComponent,
    },
  };
  const projectRevisionViewPagePathName = getProjectRevisionViewPageRoute(
    projectRevisionUnderReview?.id
  ).pathname;

  const projectRevisionCreatePagePathName =
    getProjectRevisionCreatePageRoute(id).pathname;

  const projectRevisionEditPagePathName =
    getProjectRevisionEditPageRoute(id).pathname;

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
        {numberedFormStructure.map((section) => {
          /**
           * A section has form configuration items that need to be rendered,
           * A section can also have its own form configuration to render
           */
          const taskListItems = [
            section,
            ...(section.items?.map((i) => i) ?? []),
          ].filter((s) => s.formConfiguration);

          return (
            <TaskListSection
              key={`tasklist_section_${section.sectionNumber}`}
              defaultExpandedState={
                /**
                 * Tasklist section is expanded if:
                 * - either the current step is one of its form items,
                 * - or if any of its form items has the Attention Required status
                 * */
                taskListItems.some(
                  (item) =>
                    item.formConfiguration.formIndex === Number(currentStep) ||
                    tasklistRenderingConfiguration[
                      item.formConfiguration.slug
                    ].context.some(
                      (config) => config.status === ATTENTION_REQUIRED_STATUS
                    )
                )
              }
              listItemNumber={String(section.sectionNumber)}
              listItemName={section.title}
              listItemMode={
                mode !== "update" && section.optional ? "(optional)" : ""
              }
            >
              {taskListItems.map((item, index) => {
                const ItemsComponent =
                  tasklistRenderingConfiguration[item.formConfiguration.slug]
                    .ItemsComponent;
                return (
                  <ItemsComponent
                    key={"section-item-" + index}
                    revisionId={id}
                    currentStep={currentStep}
                    mode={mode}
                    formItem={item}
                    context={
                      tasklistRenderingConfiguration[
                        item.formConfiguration.slug
                      ].context
                    }
                  />
                );
              })}
            </TaskListSection>
          );
        })}

        {/* Project Summary Section */}
        {mode === "create" && (
          <TaskListSection
            defaultExpandedState={currentStep === "summary"}
            listItemNumber={String(
              numberedFormStructure[numberedFormStructure.length - 1]
                .sectionNumber + 1
            )}
            listItemName="Submit Changes"
          >
            <TaskListItem
              stepName="summary"
              linkUrl={getProjectRevisionPageRoute(id)}
              formTitle="Review and Submit Information"
              formStatus={null}
              currentStep={currentStep}
              mode={mode}
            />
          </TaskListSection>
        )}
        {/* Amendments & Other Revisions section */}
        {useShowGrowthbookFeature("amendments") && mode !== "create" && (
          <ProjectRevisionChangeLogsTaskListSection
            projectRevisionId={id}
            listItemName="Amendments & Other Revisions"
          >
            {router.pathname === projectRevisionViewPagePathName && (
              <TaskListItem
                stepName={projectRevisionViewPagePathName}
                linkUrl={getProjectRevisionViewPageRoute(
                  projectRevisionUnderReview?.id
                )}
                formTitle={`View ${projectRevisionUnderReview?.revisionType} ${projectRevisionUnderReview?.typeRowNumber}`}
                formStatus={null}
                currentStep={projectRevisionViewPagePathName}
                mode={mode}
              />
            )}
            {/* need to check mode instead of pathname because we always want task list items to show when the tasklist is in edit/update mode regardless of route */}
            {mode === "update" && (
              <TaskListItem
                stepName={projectRevisionEditPagePathName}
                linkUrl={getProjectRevisionEditPageRoute(id)}
                // don't need to include 'Edit' in the form title because it's already added by TaskListItem
                formTitle={`${revisionType} ${typeRowNumber}`}
                formStatus={null}
                currentStep={projectRevisionEditPagePathName}
                mode={mode}
              />
            )}
            {router.pathname === projectRevisionCreatePagePathName && (
              <TaskListItem
                stepName={projectRevisionCreatePagePathName}
                formTitle={`New Revision`}
                formStatus={null}
                currentStep={projectRevisionCreatePagePathName}
                mode={mode}
              />
            )}
          </ProjectRevisionChangeLogsTaskListSection>
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
