import { MutableRefObject } from "react";
import validateFormWithErrors from "lib/helpers/validateFormWithErrors";
import { FormChangeOperation } from "__generated__/ProjectContactForm_projectRevision.graphql";
import { ProjectMilestoneReportFormGroup_projectRevision$data } from "__generated__/ProjectMilestoneReportFormGroup_projectRevision.graphql";
import { ProjectQuarterlyReportForm_projectRevision$data } from "__generated__/ProjectQuarterlyReportForm_projectRevision.graphql";
import { ProjectAnnualReportForm_projectRevision$data } from "__generated__/ProjectAnnualReportForm_projectRevision.graphql";
import { addReportingRequirementToRevisionMutation$variables } from "__generated__/addReportingRequirementToRevisionMutation.graphql";
import { updateReportingRequirementFormChangeMutation$variables } from "__generated__/updateReportingRequirementFormChangeMutation.graphql";
import { updateFormChangeMutation$variables } from "__generated__/updateFormChangeMutation.graphql";

/**
 * These generic functions are for use in the ProjectMilestoneReportFormGroup, ProjectQuarterlyReportForm and ProjectAnnualReportForm components.
 * The report forms all need to handle CRUD operations for reporting_requirement form_change records in an identical way.
 * Staging the forms before submit and sorting the forms by index are also shared functionality of these components.
 */

export const addReportFormChange = (
  mutationFn: (args: {
    variables: addReportingRequirementToRevisionMutation$variables;
  }) => void,
  revision:
    | ProjectMilestoneReportFormGroup_projectRevision$data
    | ProjectQuarterlyReportForm_projectRevision$data
    | ProjectAnnualReportForm_projectRevision$data,
  reportIndex: number,
  reportType: string,
  connectionString?: string
) => {
  const formData = {
    reportType: reportType,
    projectId: revision.projectFormChange.formDataRecordId,
    reportingRequirementIndex: reportIndex,
  };
  mutationFn({
    variables: {
      projectRevisionId: revision.rowId,
      newFormData: formData,
      connections: [connectionString],
    },
  });
};

export const updateReportFormChange = (
  mutationFn: (args: {
    variables: updateReportingRequirementFormChangeMutation$variables;
    debounceKey: string;
    optimisticResponse: any;
  }) => void,
  reportType: string,
  formChange: any,
  newFormData: JSON
) => {
  mutationFn({
    variables: {
      reportType: reportType,
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
    variables: updateReportingRequirementFormChangeMutation$variables;
    debounceKey: string;
    onCompleted: () => void;
    onError: (reason?: any) => void;
  }) => void,
  submitFn: () => void,
  formRefs: MutableRefObject<{}>,
  formChangeEdges: any,
  reportType?: string,
  updateFormChangeMutationFn?: (args: {
    variables: updateFormChangeMutation$variables;
    debounceKey: string;
    onCompleted: () => void;
    onError: (reason?: any) => void;
  }) => void
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
        id: node.id,
        formChangePatch: {
          changeStatus: "staged",
        },
      },
    };
    if (node.changeStatus === "pending") {
      const promise = new Promise<void>((resolve, reject) => {
        /* The mutation used here is dependent on whether a reportType is passed in.
           If a reportType is passed, we use the default mutationFn parameter. If not, we use the optional parameter updateFormChangeMutationFn
           to handle staging. Doing this allows us to stage all dependent form_change records for a report together & define
           how to update each those form_change records.
        */
        if (reportType)
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
        else
          updateFormChangeMutationFn({
            variables: defaultVariables,
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
