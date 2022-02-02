import type { AjvError, ObjectFieldTemplateProps } from "@rjsf/core";
export default interface FormComponentProps {
  id?: string;
  formData: any;
  onChange: (changeObject: object) => void;
  onFormErrors?: (errorsArray: AjvError[]) => void;
  ObjectFieldTemplate?: React.FC<ObjectFieldTemplateProps>;
}
