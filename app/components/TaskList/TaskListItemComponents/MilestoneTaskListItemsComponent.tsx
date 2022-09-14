import { DateTime } from "luxon";
import { getProjectRevisionFormPageRoute } from "routes/pageRoutes";
import TaskListItem from "../TaskListItem";
import { TaskListItemComponentProps } from "./BaseTaskListItemsComponent";

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

const MilestoneTaskListItemsComponent: React.FC<TaskListItemComponentProps> = ({
  revisionId,
  currentStep,
  mode,
  formItem,
  context,
}) => {
  return (
    <>
      {context.length === 0 && (
        <TaskListItem
          stepName={String(formItem.formConfiguration.formIndex)}
          linkUrl={getProjectRevisionFormPageRoute(
            revisionId,
            formItem.formConfiguration.formIndex
          )}
          formTitle={formItem.title}
          formStatus={null} // No status as there are no milestones
          currentStep={currentStep}
          mode={mode}
        />
      )}
      {context.length > 0 &&
        context.map((configItem, index) => (
          <TaskListItem
            key={configItem.milestoneIndex}
            stepName="4"
            linkUrl={getProjectRevisionFormPageRoute(
              revisionId,
              formItem.formConfiguration.formIndex,
              `Milestone${index + 1}`
            )}
            formTitle={`Milestone ${index + 1}`}
            formStatus={configItem.status}
            milestoneDueDate={displayMilestoneDueDateStatus(
              configItem.reportDueDate,
              configItem.submittedDate
            )}
            currentStep={currentStep}
            mode={mode}
            hasAnchor={true}
          />
        ))}
    </>
  );
};

export default MilestoneTaskListItemsComponent;
