import type { AjvError, ObjectFieldTemplateProps } from "@rjsf/core";
export default interface FormComponentProps {
  formData: any;
  onChange: (changeObject: object) => void;
  onFormErrors?: (errorsArray: AjvError[]) => void;
  ObjectFieldTemplate?: React.FC<ObjectFieldTemplateProps>;
}
