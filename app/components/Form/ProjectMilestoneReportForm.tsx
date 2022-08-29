import { Button } from "@button-inc/bcgov-theme";
import { milestoneUiSchema } from "data/jsonSchemaForm/projectMilestoneSchema";
import { JSONSchema7 } from "json-schema";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import { MutableRefObject, useEffect } from "react";
import { ProjectMilestoneReportFormGroup_projectRevision$data } from "__generated__/ProjectMilestoneReportFormGroup_projectRevision.graphql";
import FormBase from "./FormBase";
import { updateReportFormChange } from "./Functions/reportingRequirementFormChangeFunctions";
import { UseDebouncedMutationConfig } from "mutations/useDebouncedMutation";
import { updateReportingRequirementFormChangeMutation } from "__generated__/updateReportingRequirementFormChangeMutation.graphql";
import { Disposable } from "relay-runtime";
import { discardMilestoneFormChangeMutation } from "__generated__/discardMilestoneFormChangeMutation.graphql";
import { updateFormChangeMutation } from "__generated__/updateFormChangeMutation.graphql";
import { useFragment, UseMutationConfig, graphql } from "react-relay";
import {
  paymentSchema,
  paymentUiSchema,
} from "data/jsonSchemaForm/paymentSchema";
import { ProjectMilestoneReportForm_reportingRequirement$key } from "__generated__/ProjectMilestoneReportForm_reportingRequirement.graphql";
import useDiscardFormChange from "hooks/useDiscardFormChange";
import { useCreateFormChange } from "mutations/FormChange/createFormChange";
import { createMilestoneSchema } from "./Functions/projectMilestoneFormFunctions";
import { useMemo } from "react";

interface Props {
  formRefs: MutableRefObject<{}>;
  milestoneReport: {
    milestoneFormChange: {
      id: string;
      rowId: number;
      newFormData: object;
      changeStatus: string;
    };
    operation: "CREATE" | "UPDATE" | "ARCHIVE";
    paymentFormChange: {
      id: string;
      rowId: number;
      newFormData: object;
      changeStatus: string;
      operation: "CREATE" | "UPDATE" | "ARCHIVE";
    };
    reportingRequirementFormChange: {
      id: string;
      rowId: number;
      newFormData: { reportDueDate: string; reportType: string };
      changeStatus: string;
      asReportingRequirement: ProjectMilestoneReportForm_reportingRequirement$key;
      formDataRecordId: number;
    };
    reportingRequirementIndex: number;
  };
  projectRevision: ProjectMilestoneReportFormGroup_projectRevision$data;
  discardMilestoneReportMutation: (
    config: UseMutationConfig<discardMilestoneFormChangeMutation>
  ) => Disposable;
  applyUpdateFormChangeMutation: (
    config: UseDebouncedMutationConfig<updateReportingRequirementFormChangeMutation>
  ) => Disposable;
  updateFormChange: (
    config: UseDebouncedMutationConfig<updateFormChangeMutation>
  ) => Disposable;
  generatedReportingRequirementSchema: object;
  generatedReportingRequirementUiSchema: object;
  connections: string[];
}

const ProjectMilestoneReportForm: React.FC<Props> = ({
  formRefs,
  milestoneReport,
  projectRevision,
  discardMilestoneReportMutation,
  applyUpdateFormChangeMutation,
  updateFormChange,
  generatedReportingRequirementSchema,
  generatedReportingRequirementUiSchema,
  connections,
}) => {
  const { hasExpenses } = useFragment(
    graphql`
      fragment ProjectMilestoneReportForm_reportingRequirement on ReportingRequirement {
        hasExpenses
      }
    `,
    milestoneReport.reportingRequirementFormChange.asReportingRequirement
  );

  const [discardFormChange] = useDiscardFormChange(
    projectRevision.milestonePaymentFormChanges.__id
  );

  const [createFormChange] = useCreateFormChange();

  const generatedMilestoneSchema = useMemo(() => {
    return createMilestoneSchema(
      milestoneReport.reportingRequirementFormChange.newFormData.reportType
    );
  }, [milestoneReport.reportingRequirementFormChange.newFormData.reportType]);

  useEffect(() => {
    if (hasExpenses === false && milestoneReport.paymentFormChange) {
      discardFormChange({
        formChange: {
          id: milestoneReport.paymentFormChange.id,
          rowId: milestoneReport.paymentFormChange.rowId,
          operation: milestoneReport.paymentFormChange.operation,
        },
        onCompleted: () => {
          delete formRefs.current[milestoneReport.paymentFormChange.id];
        },
      });
    } else if (hasExpenses === true && !milestoneReport.paymentFormChange) {
      createFormChange({
        variables: {
          input: {
            projectRevisionId: projectRevision.rowId,
            formDataSchemaName: "cif",
            formDataTableName: "payment",
            jsonSchemaName: "payment",
            operation: "CREATE",
            newFormData: {
              reportingRequirementId:
                milestoneReport.reportingRequirementFormChange.formDataRecordId,
            },
          },
        },
      });
    } else if (
      hasExpenses === true &&
      milestoneReport.paymentFormChange.operation === "ARCHIVE"
    ) {
      updateFormChange({
        variables: {
          input: {
            rowId: milestoneReport.paymentFormChange.rowId,
            formChangePatch: {
              operation: "UPDATE",
            },
          },
        },
        optimisticResponse: {
          updateFormChange: {
            formChange: {
              id: milestoneReport.paymentFormChange.id,
              newFormData: milestoneReport.paymentFormChange.newFormData,
              changeStatus: "pending",
              projectRevisionByProjectRevisionId: undefined,
              operation: "UPDATE",
            },
          },
        },
        debounceKey: milestoneReport.paymentFormChange.id,
      });
    }
  }, [hasExpenses]);

  return (
    <>
      <Button
        variant="secondary"
        size="small"
        onClick={() =>
          discardMilestoneReportMutation({
            variables: {
              input: {
                revisionId: projectRevision.rowId,
                reportingRequirementIndex:
                  milestoneReport.reportingRequirementIndex,
              },
              reportType: "Milestone",
              connections: connections,
            },
            onCompleted: () => {
              if (formRefs) {
                Object.keys(formRefs.current).forEach((key) => {
                  if (!formRefs.current[key]) delete formRefs.current[key];
                });
              }
            },
          })
        }
        className="removeButton"
      >
        Remove
      </Button>
      <FormBase
        id={`form-${milestoneReport.reportingRequirementFormChange.id}`}
        validateOnMount={
          milestoneReport.reportingRequirementFormChange.changeStatus ===
          "staged"
        }
        idPrefix={`form-${milestoneReport.reportingRequirementFormChange.id}`}
        ref={(el) =>
          (formRefs.current[milestoneReport.reportingRequirementFormChange.id] =
            el)
        }
        formData={milestoneReport.reportingRequirementFormChange.newFormData}
        onChange={(change) => {
          updateReportFormChange(
            applyUpdateFormChangeMutation,
            "Milestone",
            {
              ...milestoneReport.reportingRequirementFormChange,
              changeStatus: "pending",
            },
            change.formData
          );
        }}
        schema={generatedReportingRequirementSchema as JSONSchema7}
        uiSchema={generatedReportingRequirementUiSchema}
        ObjectFieldTemplate={EmptyObjectFieldTemplate}
        formContext={{
          dueDate:
            milestoneReport.reportingRequirementFormChange.newFormData
              ?.reportDueDate,
        }}
      />
      <FormBase
        id={`form-${milestoneReport.milestoneFormChange.id}`}
        validateOnMount={
          milestoneReport.milestoneFormChange.changeStatus === "staged"
        }
        idPrefix={`form-${milestoneReport.milestoneFormChange.id}`}
        ref={(el) =>
          (formRefs.current[milestoneReport.milestoneFormChange.id] = el)
        }
        formData={milestoneReport.milestoneFormChange.newFormData}
        onChange={(change) => {
          updateFormChange({
            variables: {
              input: {
                rowId: milestoneReport.milestoneFormChange.rowId,
                formChangePatch: {
                  newFormData: change.formData,
                },
              },
            },
            optimisticResponse: {
              updateFormChange: {
                formChange: {
                  id: milestoneReport.milestoneFormChange.id,
                  newFormData: change.formData,
                  changeStatus: "pending",
                  projectRevisionByProjectRevisionId: undefined,
                },
              },
            },
            debounceKey: milestoneReport.milestoneFormChange.id,
          });
        }}
        schema={generatedMilestoneSchema as JSONSchema7}
        uiSchema={milestoneUiSchema}
        ObjectFieldTemplate={EmptyObjectFieldTemplate}
      />
      {hasExpenses && milestoneReport.paymentFormChange && (
        <FormBase
          id={`form-${milestoneReport.paymentFormChange.id}`}
          validateOnMount={
            milestoneReport.paymentFormChange.changeStatus === "staged"
          }
          idPrefix={`form-${milestoneReport.paymentFormChange.id}`}
          ref={(el) =>
            (formRefs.current[milestoneReport.paymentFormChange.id] = el)
          }
          formData={milestoneReport.paymentFormChange.newFormData}
          onChange={(change) => {
            updateFormChange({
              variables: {
                input: {
                  rowId: milestoneReport.paymentFormChange.rowId,
                  formChangePatch: {
                    newFormData: change.formData,
                  },
                },
              },
              optimisticResponse: {
                updateFormChange: {
                  formChange: {
                    id: milestoneReport.paymentFormChange.id,
                    newFormData: change.formData,
                    changeStatus: "pending",
                    projectRevisionByProjectRevisionId: undefined,
                  },
                },
              },
              debounceKey: milestoneReport.paymentFormChange.id,
            });
          }}
          schema={paymentSchema as JSONSchema7}
          uiSchema={paymentUiSchema}
          ObjectFieldTemplate={EmptyObjectFieldTemplate}
        />
      )}
    </>
  );
};

export default ProjectMilestoneReportForm;
