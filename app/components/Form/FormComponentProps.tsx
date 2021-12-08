export default interface FormComponentProps {
  formData: any;
  onChange: (changeObject: object) => void;
  onFormErrors: (errorsObject: object) => void;
}
