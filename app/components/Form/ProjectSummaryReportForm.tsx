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
    </>
  );
};

export default ProjectSummaryReportForm;
