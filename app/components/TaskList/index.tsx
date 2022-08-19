import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import { useStageDirtyFormChanges } from "mutations/FormChange/stageDirtyFormChanges";
import {
  getProjectRevisionPageRoute,
  getProjectRevisionFormPageRoute,
  getProjectRevisionAttachmentsPageRoute,
} from "routes/pageRoutes";
import { useMemo, useEffect } from "react";
import { graphql, useFragment } from "react-relay";
import { TaskList_projectRevision$key } from "__generated__/TaskList_projectRevision.graphql";
import AttachmentsTaskListSection from "./AttachmentsTaskListSection";
import TaskListItem from "./TaskListItem";
import TaskListSection from "./TaskListSection";
import { TaskListMode } from "./types";
import { ATTENTION_REQUIRED_STATUS } from "./TaskListStatus";
import { DateTime } from "luxon";
import useShowGrowthbookFeature from "lib/growthbookWrapper";

interface Props {
  projectRevision: TaskList_projectRevision$key;
  mode: TaskListMode;
}

const displayMilestoneDueDateStatus = (
  reportDueDate: string | undefined,
  submittedDate: string | undefined
) => {
  if (submittedDate) return "Completed";
  const diff = DateTime.fromISO(reportDueDate, {
    setZone: true,
    locale: "en-CA",
  }).diff(
    // Current date without time information
    DateTime.now().setZone("America/Vancouver").startOf("day"),
    "days"
  );
  if (diff.days < 0) return "Late";
  if (diff.days > 60)
    return `Due in ${Math.ceil(Math.ceil(diff.days) / 7)} weeks`;
  return `Due in ${Math.ceil(diff.days)} days`;
};

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
    fundingAgreementStatus,
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
        fundingAgreementStatus: tasklistStatusFor(formDataTableName: "funding_parameter")
        milestoneReportStatuses {
          edges {
            node {
              milestoneIndex
              reportDueDate
              submittedDate
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

  // Growthbook - teimp
  const sectionIndex = {
    annual: useShowGrowthbookFeature("teimp") ? 7 : 6,
    summary: useShowGrowthbookFeature("teimp") ? 8 : 7,
  };

  const projectOverviewSection = (step: string) => {
    return (
      <TaskListSection
        defaultExpandedState={
          currentStep === "0" ||
          projectOverviewStatus === ATTENTION_REQUIRED_STATUS
        }
        listItemNumber={step}
        listItemName="Project Overview"
      >
        <TaskListItem
          stepName={step}
          linkUrl={getProjectRevisionFormPageRoute(id, 0)}
          formTitle="Project overview"
          formStatus={projectOverviewStatus}
          currentStep={currentStep}
          mode={mode}
        />
      </TaskListSection>
    );
  };

  const projectDetailsSection = (step: string) => {
    return (
      <TaskListSection
        defaultExpandedState={
          currentStep === "1" ||
          currentStep === "2" ||
          projectManagersStatus === ATTENTION_REQUIRED_STATUS ||
          projectContactsStatus === ATTENTION_REQUIRED_STATUS
        }
        listItemNumber={step}
        listItemName="Project Details"
        listItemMode={mode === "update" ? "" : "(optional)"}
      >
        <TaskListItem
          stepName={step}
          linkUrl={getProjectRevisionFormPageRoute(id, 1)}
          formTitle="Project managers"
          formStatus={projectManagersStatus}
          currentStep={currentStep}
          mode={mode}
        />
        <TaskListItem
          stepName={step}
          linkUrl={getProjectRevisionFormPageRoute(id, 2)}
          formTitle="Project contacts"
          formStatus={projectContactsStatus}
          currentStep={currentStep}
          mode={mode}
        />
      </TaskListSection>
    );
  };

  const projectBudgetSection = (step: string) => {
    return (
      <TaskListSection
        defaultExpandedState={
          currentStep === "3" ||
          fundingAgreementStatus === ATTENTION_REQUIRED_STATUS
        }
        listItemNumber={step}
        listItemName="Budgets, Expenses & Payments"
      >
        <TaskListItem
          stepName={step}
          linkUrl={getProjectRevisionFormPageRoute(id, 3)}
          formTitle="budgets"
          formStatus={fundingAgreementStatus}
          currentStep={currentStep}
          mode={mode}
        />
      </TaskListSection>
    );
  };

  const projectMilestoneSection = (step: string) => {
    return (
      <TaskListSection
        defaultExpandedState={
          currentStep === "4" ||
          milestoneReportStatuses.edges.some(
            ({ node }) =>
              node.formCompletionStatus === ATTENTION_REQUIRED_STATUS
          )
        }
        listItemNumber={step}
        listItemName="Milestone Reports"
      >
        {milestoneReportStatuses.edges.length === 0 ? (
          <TaskListItem
            stepName={step}
            linkUrl={getProjectRevisionFormPageRoute(id, 4)}
            formTitle="Milestone reports"
            formStatus={null} // No status as there are no milestones
            currentStep={currentStep}
            mode={mode}
          />
        ) : (
          milestoneReportStatuses.edges.map(({ node }, index) => (
            <TaskListItem
              key={node.milestoneIndex}
              stepName={step}
              linkUrl={getProjectRevisionFormPageRoute(
                id,
                4,
                `Milestone${index + 1}`
              )}
              formTitle={`Milestone ${index + 1}`}
              formStatus={node.formCompletionStatus}
              milestoneDueDate={displayMilestoneDueDateStatus(
                node.reportDueDate,
                node.submittedDate
              )}
              currentStep={currentStep}
              mode={mode}
              hasAnchor={true}
            />
          ))
        )}
      </TaskListSection>
    );
  };

  const projectQuarterlyReportsSection = (step: string) => {
    return (
      <TaskListSection
        defaultExpandedState={
          currentStep === "5" ||
          quarterlyReportsStatus === ATTENTION_REQUIRED_STATUS
        }
        listItemNumber={step}
        listItemName="Quarterly Reports"
      >
        <TaskListItem
          stepName={step}
          linkUrl={getProjectRevisionFormPageRoute(id, 5)}
          formTitle="Quarterly reports"
          formStatus={quarterlyReportsStatus}
          currentStep={currentStep}
          mode={mode}
        />
      </TaskListSection>
    );
  };
  // {useShowGrowthbookFeature("teimp") && (
  const projectEmissionsIntensityReportSection = (step: string) => {
    return (
      <TaskListSection
        defaultExpandedState={
          currentStep === "6" ||
          quarterlyReportsStatus === ATTENTION_REQUIRED_STATUS
        }
        listItemNumber={step}
        listItemName="Emissions Intensity Report"
      >
        <TaskListItem
          stepName={step}
          linkUrl={getProjectRevisionFormPageRoute(id, 6)}
          formTitle="Emissions Intensity Report"
          formStatus={quarterlyReportsStatus}
          currentStep={currentStep}
          mode={mode}
        />
      </TaskListSection>
    );
  };

  const projectAnnualReportSection = (step: string) => {
    return (
      <TaskListSection
        defaultExpandedState={
          currentStep === String(sectionIndex.annual) ||
          annualReportsStatus === ATTENTION_REQUIRED_STATUS
        }
        listItemNumber={step}
        listItemName="Annual Reports"
      >
        <TaskListItem
          stepName={String(sectionIndex.annual)}
          linkUrl={getProjectRevisionFormPageRoute(id, sectionIndex.annual)}
          formTitle="Annual reports"
          formStatus={annualReportsStatus}
          currentStep={currentStep}
          mode={mode}
        />
      </TaskListSection>
    );
  };

  const projectSummarySection = () => {
    return (
      <TaskListSection
        defaultExpandedState={currentStep === "summary"}
        listItemNumber={String(sectionIndex.summary)}
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
    );
  };

  const projectAttachmentSection = () => {
    return (
      <AttachmentsTaskListSection
        icon={faPaperclip}
        title="Attachments"
        linkUrl={getProjectRevisionAttachmentsPageRoute(id)}
      />
    );
  };

  let shouldRenderAttachments = () => {
    if (mode === "view") return true;
  };

  const config = [
    { section: projectOverviewSection, render: true },
    { section: projectDetailsSection, render: true },
    { section: projectBudgetSection, render: true },
    { section: projectMilestoneSection, render: true },
    { section: projectEmissionsIntensityReportSection, render: true },
    { section: projectQuarterlyReportsSection, render: true },
    {
      section: projectAnnualReportSection,
      render: useShowGrowthbookFeature("teimp"),
    },
    {
      section: projectSummarySection,
      render: useShowGrowthbookFeature("teimp"),
    },
    {
      section: projectAttachmentSection,
      render: shouldRenderAttachments(),
    },
  ];

  var newConfig = config.reduce(function (acc, curr) {
    if (curr.render === true) acc.push(curr.section);
    return acc;
  }, []);

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
        {newConfig.map((section, index) => {
          return section(index + 1);
        })}
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
