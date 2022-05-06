interface Props {
  formStatus: string;
}

const TaskListStatus: React.FC<Props> = ({ formStatus }) => {
  if (formStatus === "Attention Required")
    return (
      <div className="status">
        <strong>{formStatus}</strong>
      </div>
    );
  return <div className="status">{formStatus}</div>;
};

export default TaskListStatus;
