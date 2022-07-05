import { Button } from "@button-inc/bcgov-theme";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReportDueIndicator from "components/ReportingRequirement/ReportDueIndicator";
import Status from "components/ReportingRequirement/Status";
import FormBorder from "lib/theme/components/FormBorder";
import { useUpdateReportingRequirementFormChange } from "mutations/ProjectReportingRequirement/updateReportingRequirementFormChange";
import { useRouter } from "next/router";
import { MutableRefObject, useEffect, useMemo, useRef } from "react";
import { graphql, useFragment } from "react-relay";
import CollapsibleReport from "components/ReportingRequirement/CollapsibleReport";
import { ProjectMilestoneReportFormGroup_projectRevision$key } from "__generated__/ProjectMilestoneReportFormGroup_projectRevision.graphql";
import { ProjectMilestoneReportFormGroup_query$key } from "__generated__/ProjectMilestoneReportFormGroup_query.graphql";
import { stageReportFormChanges } from "./reportingRequirementFormChangeFunctions";
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
import ProjectMilestoneReportForm from "./ProjectMilestoneReportForm";

interface Props {
  onSubmit: () => void;
  projectRevision: ProjectMilestoneReportFormGroup_projectRevision$key;
  query: ProjectMilestoneReportFormGroup_query$key;
}

const ProjectMilestoneReportFormGroup: React.FC<Props> = (props) => {
  const formRefs: MutableRefObject<{}> = useRef({});
  const router = useRouter();

  const projectRevision = useFragment(
    graphql`
      fragment ProjectMilestoneReportFormGroup_projectRevision on ProjectRevision {
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
              # eslint-disable-next-line relay/unused-fields
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
      fragment ProjectMilestoneReportFormGroup_query on Query {
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
    return [
      ...projectRevision.milestoneReportingRequirementFormChanges.edges.map(
        ({ node }) => node?.rowId
      ),
      ...projectRevision.milestoneFormChanges.edges.map(
        ({ node }) => node?.rowId
      ),
      ...projectRevision.milestonePaymentFormChanges.edges.map(
        ({ node }) => node?.rowId
      ),
    ];
  }, [
    projectRevision.milestoneFormChanges.edges,
    projectRevision.milestonePaymentFormChanges.edges,
    projectRevision.milestoneReportingRequirementFormChanges.edges,
  ]);

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
                <ProjectMilestoneReportForm
                  formRefs={formRefs}
                  milestoneReport={milestoneReport}
                  projectRevision={projectRevision}
                  discardMilestoneReportMutation={
                    discardMilestoneReportMutation
                  }
                  applyUpdateFormChangeMutation={applyUpdateFormChangeMutation}
                  updateFormChange={updateFormChange}
                  generatedReportingRequirementSchema={
                    generatedReportingRequirementSchema
                  }
                  generatedReportingRequirementUiSchema={
                    generatedReportingRequirementUiSchema
                  }
                  generatedMilestoneSchema={generatedMilestoneSchema}
                  connections={[
                    projectRevision.milestoneReportingRequirementFormChanges
                      .__id,
                    projectRevision.milestoneFormChanges.__id,
                    projectRevision.milestonePaymentFormChanges.__id,
                  ]}
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
            "General Milestone",
            updateFormChange
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

export default ProjectMilestoneReportFormGroup;
