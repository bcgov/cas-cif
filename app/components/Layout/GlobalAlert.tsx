import Alert from "@button-inc/bcgov-theme/Alert";
interface Props {
  error: string;
}

const GlobalAlert = (props: Props) => {
  return (
    <Alert variant="danger" closable>
      {props.error}
    </Alert>
  );
};

export default GlobalAlert;
