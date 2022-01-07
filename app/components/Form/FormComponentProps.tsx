import type { AjvError } from "@rjsf/core";
export default interface FormComponentProps {
  formData: any;
  formContext: any;
  widgets: any;
  onChange: (changeObject: object) => void;
  onFormErrors: (errorsArray: AjvError[]) => void;
}
