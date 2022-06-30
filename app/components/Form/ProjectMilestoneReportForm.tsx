import { Button } from "@button-inc/bcgov-theme";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CollapsibleReport from "components/ReportingRequirement/CollapsibleReport";
import ReportDueIndicator from "components/ReportingRequirement/ReportDueIndicator";
import Status from "components/ReportingRequirement/Status";
import { milestoneUiSchema } from "data/jsonSchemaForm/projectMilestoneSchema";
import { JSONSchema7 } from "json-schema";
import FormBorder from "lib/theme/components/FormBorder";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import { useUpdateReportingRequirementFormChange } from "mutations/ProjectReportingRequirement/updateReportingRequirementFormChange";
import { useRouter } from "next/router";
import { MutableRefObject, useEffect, useMemo, useRef } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectMilestoneReportForm_projectRevision$key } from "__generated__/ProjectMilestoneReportForm_projectRevision.graphql";
import { ProjectMilestoneReportForm_query$key } from "__generated__/ProjectMilestoneReportForm_query.graphql";
import FormBase from "./FormBase";
import {
  stageReportFormChanges,
  updateReportFormChange,
} from "./reportingRequirementFormChangeFunctions";
import SavingIndicator from "./SavingIndicator";
import UndoChangesButton from "./UndoChangesButton";
import { useAddMilestoneToRevision } from "mutations/MilestoneReport/addMilestoneToRevision";
import useDiscardMilestoneFormChange from "mutations/MilestoneReport/discardMilestoneFormChange";
import { useUpdateFormChange } from "mutations/FormChange/updateFormChange";
import {
  getConsolidatedMilestoneFormData,
  createMilestoneReportingRequirementSchema,
  createCustomMilestoneReportingRequirementUiSchema,
  createMilestoneSchema,
} from "./Functions/projectMilestoneFormFunctions";

interface Props {
  onSubmit: () => void;
  projectRevision: ProjectMilestoneReportForm_projectRevision$key;
  query: ProjectMilestoneReportForm_query$key;
}

const ProjectMilestoneReportForm: React.FC<Props> = (props) => {
  const formRefs: MutableRefObject<{}> = useRef({});
  const router = useRouter();

  const projectRevision = useFragment(
    graphql`
      fragment ProjectMilestoneReportForm_projectRevision on ProjectRevision {
        id
        # eslint-disable-next-line relay/unused-fields
        rowId
        milestoneReportingRequirementFormChanges: formChangesFor(
          formDataTableName: "reporting_requirement"
          reportType: "Milestone"
          first: 1000
        )
          @connection(
            key: "connection_milestoneReportingRequirementFormChanges"
          ) {
          __id
          edges {
            node {
              id
              rowId
              # eslint-disable-next-line relay/unused-fields
              formDataRecordId
              operation
              newFormData
              changeStatus
              # eslint-disable-next-line relay/unused-fields
              formChangeByPreviousFormChangeId {
                changeStatus
                newFormData
              }
              asReportingRequirement {
                ...CollapsibleReport_reportingRequirement
              }
            }
          }
        }
        milestoneFormChanges: formChangesFor(
          formDataTableName: "milestone_report"
          first: 1000
        ) @connection(key: "connection_milestoneFormChanges") {
          __id
          edges {
            node {
              id
              rowId
              newFormData
              changeStatus
              # eslint-disable-next-line relay/unused-fields
              formChangeByPreviousFormChangeId {
                changeStatus
                newFormData
              }
            }
          }
        }
        milestonePaymentFormChanges: formChangesFor(
          formDataTableName: "payment"
          first: 1000
        ) @connection(key: "connection_milestonePaymentFormChanges") {
          __id
          edges {
            node {
              id
              rowId
              newFormData
              changeStatus
              # eslint-disable-next-line relay/unused-fields
              formChangeByPreviousFormChangeId {
                changeStatus
                newFormData
              }
            }
          }
        }
        upcomingMilestoneReportFormChange: upcomingReportingRequirementFormChange(
          reportType: "Milestone"
        ) {
          # eslint-disable-next-line relay/must-colocate-fragment-spreads
          ...ReportDueIndicator_formChange
          asReportingRequirement {
            reportDueDate
          }
        }
        # eslint-disable-next-line relay/unused-fields
        projectFormChange {
          formDataRecordId
        }
      }
    `,
    props.projectRevision
  );

  const query = useFragment(
    graphql`
      fragment ProjectMilestoneReportForm_query on Query {
        allReportTypes(filter: { name: { notIn: ["Quarterly", "Annual"] } }) {
          edges {
            node {
              # eslint-disable-next-line relay/unused-fields
              name
            }
          }
        }
      }
    `,
    props.query
  );

  useEffect(() => {
    if (router.query.anchor !== "Milestone0")
      router.push(`#${router.query.anchor}`);
    // TODO: refactor useEffect. In the meantime, ignore the eslint warning--fixing it causes infinite rerender.
  }, [router.query.anchor]);

  // Match the reportingRequirement form change records with the dependent milestoneReport and payment form change records
  const consolidatedFormData = useMemo(() => {
    return getConsolidatedMilestoneFormData(
      projectRevision.milestoneReportingRequirementFormChanges.edges,
      projectRevision.milestoneFormChanges.edges,
      projectRevision.milestonePaymentFormChanges.edges
    );
  }, [projectRevision]);

  const generatedReportingRequirementSchema = useMemo(() => {
    return createMilestoneReportingRequirementSchema(query.allReportTypes);
  }, [query.allReportTypes]);

  const generatedReportingRequirementUiSchema = useMemo(() => {
    return createCustomMilestoneReportingRequirementUiSchema();
  }, []);

  const generatedMilestoneSchema = useMemo(() => {
    return createMilestoneSchema();
  }, []);

  const [addMilestoneReportMutation, isAdding] = useAddMilestoneToRevision();

  const [applyUpdateFormChangeMutation, isUpdating] =
    useUpdateReportingRequirementFormChange();

  const [updateFormChange, isUpdatingFormChange] = useUpdateFormChange();

  const [discardMilestoneReportMutation] = useDiscardMilestoneFormChange();

  // Sort consolidated milestone form change records
  const [sortedMilestoneReports, nextMilestoneReportIndex] = useMemo(() => {
    const filteredReports = consolidatedFormData
      .map((formData) => formData)
      .filter((report) => report.operation !== "ARCHIVE");

    filteredReports.sort(
      (a, b) => a.reportingRequirementIndex - b.reportingRequirementIndex
    );
    const nextIndex =
      filteredReports.length > 0
        ? filteredReports[filteredReports.length - 1]
            .reportingRequirementIndex + 1
        : 1;

    return [filteredReports, nextIndex];
  }, [consolidatedFormData]);

  // Get all form changes ids to get used in the undo changes button
  const formChangeIds = useMemo(() => {
    return projectRevision.milestoneReportingRequirementFormChanges.edges.map(
      ({ node }) => node?.rowId
    );
  }, [projectRevision.milestoneReportingRequirementFormChanges]);

  const upcomingReportDueDate =
    projectRevision.upcomingMilestoneReportFormChange?.asReportingRequirement
      .reportDueDate;

  const reportSubmittedDates = useMemo(() => {
    return projectRevision.milestoneReportingRequirementFormChanges.edges.map(
      ({ node }) => node.newFormData.submittedDate
    );
  }, [projectRevision.milestoneReportingRequirementFormChanges.edges]);

  return (
    <div>
      <header id={`Milestone0`}>
        <h2>Milestone Reports</h2>
        <UndoChangesButton formChangeIds={formChangeIds} formRefs={formRefs} />
        <SavingIndicator isSaved={!isUpdating && !isAdding} />
      </header>
      <Status
        upcomingReportDueDate={upcomingReportDueDate}
        reportSubmittedDates={reportSubmittedDates}
        reportType={"Milestone"}
      />
      <ReportDueIndicator
        reportTitle="Milestone Report"
        reportDueFormChange={projectRevision.upcomingMilestoneReportFormChange}
      />
      <FormBorder>
        <Button
          variant="secondary"
          onClick={() =>
            addMilestoneReportMutation({
              variables: {
                input: {
                  revisionId: projectRevision.rowId,
                  reportingRequirementIndex: nextMilestoneReportIndex,
                },
              },
            })
          }
          className="addButton"
        >
          <FontAwesomeIcon icon={faPlusCircle} /> Add another milestone report
        </Button>

        {sortedMilestoneReports.map((milestoneReport, index) => {
          return (
            <div
              key={milestoneReport.reportingRequirementFormChange.id}
              id={`Milestone${index + 1}`}
            >
              <CollapsibleReport
                title={`Milestone ${index + 1}`}
                reportingRequirement={
                  milestoneReport.reportingRequirementFormChange
                    .asReportingRequirement
                }
              >
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() =>
                    discardMilestoneReportMutation({
                      variables: {
                        input: {
                          revisionId: projectRevision.rowId,
                          reportingRequirementIndex:
                            milestoneReport.reportingRequirementFormChange
                              .newFormData.reportingRequirementIndex,
                        },
                        reportType: "Milestone",
                        connections: [
                          projectRevision
                            .milestoneReportingRequirementFormChanges.__id,
                          projectRevision.milestoneFormChanges.__id,
                          projectRevision.milestonePaymentFormChanges.__id,
                        ],
                      },
                      onCompleted: () => {
                        if (formRefs) {
                          Object.keys(formRefs.current).forEach((key) => {
                            if (!formRefs.current[key])
                              delete formRefs.current[key];
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
                    milestoneReport.reportingRequirementFormChange
                      .changeStatus === "staged"
                  }
                  idPrefix={`form-${milestoneReport.reportingRequirementFormChange.id}`}
                  ref={(el) =>
                    (formRefs.current[
                      milestoneReport.reportingRequirementFormChange.id
                    ] = el)
                  }
                  formData={
                    milestoneReport.reportingRequirementFormChange.newFormData
                  }
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
                    milestoneReport.milestoneFormChange.changeStatus ===
                    "staged"
                  }
                  idPrefix={`form-${milestoneReport.milestoneFormChange.id}`}
                  ref={(el) =>
                    (formRefs.current[milestoneReport.milestoneFormChange.id] =
                      el)
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
                      debounceKey: milestoneReport.milestoneFormChange.id,
                    });
                  }}
                  schema={generatedMilestoneSchema as JSONSchema7}
                  uiSchema={milestoneUiSchema}
                  ObjectFieldTemplate={EmptyObjectFieldTemplate}
                />
              </CollapsibleReport>
            </div>
          );
        })}
      </FormBorder>
      <Button
        size="medium"
        variant="primary"
        onClick={() =>
          stageReportFormChanges(
            applyUpdateFormChangeMutation,
            props.onSubmit,
            formRefs,
            [
              ...projectRevision.milestoneReportingRequirementFormChanges.edges,
              ...projectRevision.milestoneFormChanges.edges,
              ...projectRevision.milestonePaymentFormChanges.edges,
            ],
            updateFormChange,
            "General Milestone"
          )
        }
        disabled={isUpdating || isUpdatingFormChange}
      >
        Submit Milestone Reports
      </Button>
      <style jsx>{`
        div :global(button.pg-button) {
          margin-left: 0.4em;
          margin-right: 0em;
        }
        div :global(button.addButton) {
          margin-bottom: 1em;
        }
        div :global(button.removeButton) {
          float: right;
        }
      `}</style>
    </div>
  );
};

export default ProjectMilestoneReportForm;
