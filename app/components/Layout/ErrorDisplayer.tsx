import { ErrorContext } from "contexts/ErrorContext";
import { useContext } from "react";

export const ErrorDisplayer = () => {
  const { setError } = useContext(ErrorContext);
  return (
    <button onClick={() => setError("error from error displayer")}>
      I make errors show up
    </button>
  );
};
