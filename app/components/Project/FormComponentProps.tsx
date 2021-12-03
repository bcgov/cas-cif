export default interface FormComponentProps {
  formData: any;
  applyChangesFromComponent: (changeObject: object) => void;
  onFormErrors: (errorsObject: object) => void;
}
