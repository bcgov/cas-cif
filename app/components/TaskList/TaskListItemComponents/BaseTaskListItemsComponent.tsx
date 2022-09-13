import { getProjectRevisionFormPageRoute } from "routes/pageRoutes";
import TaskListItem from "../TaskListItem";
import { IFormItem, IIndexedFormConfiguration, TaskListMode } from "../types";

export interface TaskListItemComponentProps {
  revisionId: string;
  currentStep: string;
  mode: TaskListMode;
  formItem: IFormItem<IIndexedFormConfiguration>;
  context: {
    status: string;
    [key: string]: any;
  }[];
}

const BaseTaskListItemComponent: React.FC<TaskListItemComponentProps> = ({
  revisionId,
  currentStep,
  mode,
  formItem,
  context,
}) => {
  return (
    <TaskListItem
      stepName={String(formItem.formConfiguration.formIndex)}
      linkUrl={getProjectRevisionFormPageRoute(
        revisionId,
        formItem.formConfiguration.formIndex
      )}
      formTitle={formItem.title}
      formStatus={context[0]?.status}
      currentStep={currentStep}
      mode={mode}
    />
  );
};

export default BaseTaskListItemComponent;
