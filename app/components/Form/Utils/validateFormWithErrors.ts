export default function validateFormWithErrors(formObject: HTMLFormElement) {
  formObject.onSubmit({
    preventDefault: () => {},
    persist: () => {},
  });
  // Effectively validating the form a second time to retrieve the errors
  const validationResult = formObject.validate(formObject.state.formData);

  return validationResult.errors;
}
