import Alert from "@button-inc/bcgov-theme/Alert";
import { ErrorContext } from "contexts/ErrorContext";
import { useContext } from "react";

const GlobalAlert = (props: Props) => {
  return (
    <Alert variant="danger" closable>
      {props.error}
    </Alert>
  );
};

export default GlobalAlert;
