export interface ISupportExternalValidation {
  selfValidate(): any[];
}

export interface ValidatingFormProps {
  setValidatingForm: (validatingForm: ISupportExternalValidation) => void;
}
