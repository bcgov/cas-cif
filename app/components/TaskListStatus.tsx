interface Props {
  formStatus: string;
}

const statusStyle = (
  <style jsx>{`
    .status {
      text-align: right;
      padding-right: 5px;
    }
  `}</style>
);

const TaskListStatus: React.FC<Props> = ({ formStatus }) => {
  if (formStatus === "Attention Required")
    return (
      <>
        <div className="status">
          <strong>{formStatus}</strong>
        </div>
        {statusStyle}
      </>
    );
  return (
    <>
      <div className="status">{formStatus}</div>
      {statusStyle}
    </>
  );
};

export default TaskListStatus;
