import { MutableRefObject } from "react";
import validateFormWithErrors from "lib/helpers/validateFormWithErrors";
import { FormChangeOperation } from "__generated__/ProjectContactForm_projectRevision.graphql";
import { ProjectMilestoneReportForm_projectRevision$data } from "__generated__/ProjectMilestoneReportForm_projectRevision.graphql";
import { addReportingRequirementToRevisionMutation$variables } from "__generated__/addReportingRequirementToRevisionMutation.graphql";
import { updateFormChangeMutation$variables } from "__generated__/updateFormChangeMutation.graphql";

/**
 * These generic functions are for use in the ProjectMilestoneReportForm, ProjectQuarterlyReportForm and ProjectAnnualReportForm components.
 * The report forms all need to handle CRUD operations for reporting_requirement form_change records in an identical way.
 * Staging the forms before submit and sorting the forms by index are also shared functionality of these components.
 */

export const addReportFormChange = (
  mutationFn: (args: {
    variables: addReportingRequirementToRevisionMutation$variables;
  }) => void,
  revision: ProjectMilestoneReportForm_projectRevision$data,
  reportIndex: number
) => {
  const formData = {
    status: "on_track",
    projectId: revision.projectFormChange.formDataRecordId,
    reportingRequirementIndex: reportIndex,
  };
  mutationFn({
    variables: {
      projectRevisionId: revision.rowId,
      newFormData: formData,
      connections: [revision.projectMilestoneReportFormChanges.__id],
    },
  });
};

export const updateReportFormChange = (
  mutationFn: (args: {
    variables: updateFormChangeMutation$variables;
    debounceKey: string;
    optimisticResponse: any;
  }) => void,
  formChange: any,
  newFormData: JSON
) => {
  mutationFn({
    variables: {
      input: {
        id: formChange.id,
        formChangePatch: {
          newFormData,
          changeStatus: formChange.changeStatus,
        },
      },
    },
    debounceKey: formChange.id,
    optimisticResponse: {
      updateFormChange: {
        formChange: {
          id: formChange.id,
          newFormData: newFormData,
          changeStatus: formChange.changeStatus,
        },
      },
    },
  });
};

export const deleteReportFormChange = (
  mutationFn: (args: {
    formChange: { id: string; operation: "ARCHIVE" | "CREATE" | "UPDATE" };
    onCompleted: () => void;
  }) => void,
  formChangeId: string,
  formChangeOperation: FormChangeOperation,
  formRefs: MutableRefObject<{}>
) => {
  mutationFn({
    formChange: { id: formChangeId, operation: formChangeOperation },
    onCompleted: () => {
      delete formRefs.current[formChangeId];
    },
  });
};

export const stageReportFormChanges = async (
  mutationFn: (args: {
    variables: updateFormChangeMutation$variables;
    debounceKey: string;
    onCompleted: () => void;
    onError: (reason?: any) => void;
  }) => void,
  submitFn: () => void,
  formRefs: MutableRefObject<{}>,
  formChangeEdges: any
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
    if (node.changeStatus === "pending") {
      const promise = new Promise<void>((resolve, reject) => {
        mutationFn({
          variables: {
            input: {
              id: node.id,
              formChangePatch: {
                changeStatus: "staged",
              },
            },
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

    if (validationErrors.length === 0) submitFn();
  } catch (e) {
    // the failing mutation will display an error message and send the error to sentry
  }
};

export const getSortedReports = (formChangeEdges) => {
  const filteredReports = formChangeEdges
    .map(({ node }) => node)
    .filter((report) => report.operation !== "ARCHIVE");

  filteredReports.sort(
    (a, b) =>
      a.newFormData.reportingRequirementIndex -
      b.newFormData.reportingRequirementIndex
  );
  const nextIndex =
    filteredReports.length > 0
      ? filteredReports[filteredReports.length - 1].newFormData
          .reportingRequirementIndex + 1
      : 1;

  return [filteredReports, nextIndex];
};
