import type { AjvError } from "@rjsf/core";
export default interface FormComponentProps {
  formData: any;
  onChange: (changeObject: object) => void;
  onFormErrors: (errorsArray: AjvError[]) => void;
}
