import { Button } from "@button-inc/bcgov-theme";
import { milestoneUiSchema } from "data/jsonSchemaForm/projectMilestoneSchema";
import { JSONSchema7 } from "json-schema";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import { MutableRefObject } from "react";
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
import { ProjectMilestoneReportForm_reportingReqiurement$key } from "__generated__/ProjectMilestoneReportForm_reportingReqiurement.graphql";

interface Props {
  formRefs: MutableRefObject<{}>;
  milestoneReport: {
    milestoneFormChange: {
      id: string;
      newFormData: object;
      changeStatus: string;
    };
    operation: "CREATE" | "UPDATE | ARCHIVE";
    paymentFormChange: {
      id: string;
      newFormData: object;
      changeStatus: string;
    };
    reportingRequirementFormChange: {
      id: string;
      newFormData: { reportDueDate: string };
      changeStatus: string;
      asReportingRequirement: object;
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
  generatedMilestoneSchema: object;
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
  generatedMilestoneSchema,
  connections,
}) => {
  const { hasExpenses } = useFragment(
    graphql`
      fragment ProjectMilestoneReportForm_reportingReqiurement on ReportingRequirement {
        hasExpenses
      }
    `,
    milestoneReport.reportingRequirementFormChange
      .asReportingRequirement as ProjectMilestoneReportForm_reportingReqiurement$key
  );

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
                id: milestoneReport.milestoneFormChange.id,
                formChangePatch: {
                  changeStatus: "pending",
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
      {hasExpenses && (
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
                  id: milestoneReport.paymentFormChange.id,
                  formChangePatch: {
                    changeStatus: "pending",
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
