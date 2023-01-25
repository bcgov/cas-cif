interface Props {
  projectRevision: any;
  viewOnly?: boolean;
}

const ProjectSummaryReportFormSummary: React.FC<Props> = (props) => {
  return (
    <>
      <h3> Project Summary Report Form Summary Placeholder </h3>
      <p>{props.projectRevision.changeStatus}</p>
    </>
  );
};

export default ProjectSummaryReportFormSummary;
