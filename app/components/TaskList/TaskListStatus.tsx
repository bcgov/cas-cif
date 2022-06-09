import { css } from "styled-components";

interface Props {
  formStatus: string;
}
export const ATTENTION_REQUIRED_STATUS = "Attention Required";

// a workaround for the styled-jsx <style jsx> boolean property issue (see:https://github.com/vercel/next.js/issues/3432)
const statusStyle = css`
  .status {
    text-align: right;
    padding-right: 5px;
  }
`;

const TaskListStatus: React.FC<Props> = ({ formStatus }) => {
  if (
    formStatus === ATTENTION_REQUIRED_STATUS ||
    formStatus?.includes("days") ||
    formStatus?.includes("Late")
  )
    return (
      <>
        <div className="status">
          <strong>{formStatus}</strong>
        </div>
        <style jsx>{statusStyle}</style>
      </>
    );
  return (
    <>
      <div className="status">{formStatus}</div>
      <style jsx>{statusStyle}</style>
    </>
  );
};

export default TaskListStatus;
