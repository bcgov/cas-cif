import validateFormWithErrors from "lib/helpers/validateFormWithErrors";
import { MutableRefObject } from "react";
import { updateReportingRequirementFormChangeMutation$variables } from "__generated__/updateReportingRequirementFormChangeMutation.graphql";

const stageMultipleReportingRequirementFormChanges = async (
  mutationFn: (args: {
    variables: updateReportingRequirementFormChangeMutation$variables;
    debounceKey: string;
    onCompleted: () => void;
    onError: (reason?: any) => void;
  }) => void,
  submitFn: () => void,
  formRefs: MutableRefObject<{}>,
  formChangeEdges: any,
  reportType?: string
) => {
  const validationErrors = Object.keys(formRefs.current).reduce(
    (agg, formId) => {
      const formObject = formRefs.current[formId];
      return [...agg, ...validateFormWithErrors(formObject)];
    },
    []
  );

  const completedPromises: Promise<void>[] = [];

  formChangeEdges.forEach(({ node }) => {
    const defaultVariables = {
      input: {
        rowId: node.rowId,
        formChangePatch: {
          newFormData: node.newFormData,
        },
      },
    };
    if (node.changeStatus === "pending") {
      const promise = new Promise<void>((resolve, reject) => {
        mutationFn({
          variables: {
            reportType: reportType,
            ...defaultVariables,
          },
          debounceKey: node.id,
          onCompleted: () => {
            resolve();
          },
          onError: reject,
        });
      });
      completedPromises.push(promise);
    }
  });
  try {
    await Promise.all(completedPromises);

    /** This is the redirect call passed from the NextJS form index page */
    if (validationErrors.length === 0) submitFn();
  } catch (e) {
    // the failing mutation will display an error message and send the error to sentry
  }
};

export default stageMultipleReportingRequirementFormChanges;
