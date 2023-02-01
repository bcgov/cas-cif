import {
  projectSummaryReportSchema,
  projectSummaryReportUiSchema,
} from "data/jsonSchemaForm/projectSummaryReportSchema";
import { JSONSchema7 } from "json-schema";
import FormBase from "./FormBase";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";

interface Props {
  projectRevision: any;
  viewOnly?: boolean;
}

const ProjectSummaryReportFormSummary: React.FC<Props> = (props) => {
  return (
    <>
      <h3> Project Summary Report Form Summary Placeholder </h3>
      <p>{props.projectRevision.changeStatus}</p>
      <FormBase
        {...props}
        theme={readOnlyTheme}
        schema={projectSummaryReportSchema as JSONSchema7}
        uiSchema={projectSummaryReportUiSchema}
      />
    </>
  );
};

export default ProjectSummaryReportFormSummary;
