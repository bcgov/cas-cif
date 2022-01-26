import type { AjvError } from "@rjsf/core";
import { MutableRefObject } from "react";
export default interface FormComponentProps {
  formData: any;
  onChange: (changeObject: object) => void;
  onFormErrors?: (errorsArray: AjvError[]) => void;

  /**
   * Callback to handle the form's ref on form load.
   * The rjsf component will call this with itself,
   * and allow the dev to manipulate the form object itself.
   */
  setRef?: MutableRefObject<any>;
}
