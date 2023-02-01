import {
  projectSummaryReportSchema,
  projectSummaryReportUiSchema,
} from "data/jsonSchemaForm/projectSummaryReportSchema";
import { JSONSchema7 } from "json-schema";
import FormBase from "./FormBase";

interface Props {
  query: any;
  projectRevision: any;
  onSubmit: () => void;
}

const ProjectSummaryReportForm: React.FC<Props> = (props) => {
  return (
    <>
      <h3>Project Summary Report Form Placeholder</h3>
      <p>{props.projectRevision.changeStatus}</p>
      <FormBase
        {...props}
        schema={projectSummaryReportSchema as JSONSchema7}
        uiSchema={projectSummaryReportUiSchema}
      />
    </>
  );
};

export default ProjectSummaryReportForm;
