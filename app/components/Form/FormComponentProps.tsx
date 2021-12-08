export default interface FormComponentProps {
  formData: any;
  tableName: string;
  onChange: (changeObject: object) => void;
  onFormErrors: (errorsObject: object) => void;
}
