import { Button } from "@button-inc/bcgov-theme";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReportGenerator from "components/ReportingRequirement/ReportGenerator";
import CollapsibleReport from "components/ReportingRequirement/CollapsibleReport";
import ReportDueIndicator from "components/ReportingRequirement/ReportDueIndicator";
import Status from "components/ReportingRequirement/Status";
import { reportingRequirementUiSchema } from "data/jsonSchemaForm/projectReportingRequirementUiSchema";
import { JSONSchema7 } from "json-schema";
import FormBorder from "lib/theme/components/FormBorder";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import { useAddReportingRequirementToRevision } from "mutations/ProjectReportingRequirement/addReportingRequirementToRevision";
import useDiscardReportingRequirementFormChange from "mutations/ProjectReportingRequirement/discardReportingRequirementFormChange";
import { useStageReportingRequirementFormChange } from "mutations/ProjectReportingRequirement/stageReportingRequirementFormChange";
import { useUpdateReportingRequirementFormChange } from "mutations/ProjectReportingRequirement/updateReportingRequirementFormChange";
import { MutableRefObject, useMemo, useRef } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectQuarterlyReportForm_projectRevision$key } from "__generated__/ProjectQuarterlyReportForm_projectRevision.graphql";
import FormBase from "./FormBase";
import {
  addReportFormChange,
  deleteReportFormChange,
  getSortedReports,
  stageReportFormChanges,
  updateReportFormChange,
} from "./Functions/reportingRequirementFormChangeFunctions";
import SavingIndicator from "./SavingIndicator";
import UndoChangesButton from "./UndoChangesButton";
import { useGenerateQuarterlyReports } from "mutations/ProjectReportingRequirement/generateQuarterlyReports";

interface Props {
  onSubmit: () => void;
  projectRevision: ProjectQuarterlyReportForm_projectRevision$key;
}

const ProjectQuarterlyReportForm: React.FC<Props> = (props) => {
  const formRefs: MutableRefObject<{}> = useRef({});

  const projectRevision = useFragment(
    graphql`
      fragment ProjectQuarterlyReportForm_projectRevision on ProjectRevision {
        id
        rowId
        projectQuarterlyReportFormChanges: formChangesFor(
          first: 502
          formDataTableName: "reporting_requirement"
          reportType: "Quarterly"
        ) @connection(key: "connection_projectQuarterlyReportFormChanges") {
          __id
          edges {
            node {
              rowId
              id
              newFormData
              operation
              changeStatus
              asReportingRequirement {
                ...CollapsibleReport_reportingRequirement
              }
              formByJsonSchemaName {
                jsonSchema
              }
            }
          }
        }
        upcomingQuarterlyReportFormChange: upcomingReportingRequirementFormChange(
          reportType: "Quarterly"
        ) {
          id
          ...ReportDueIndicator_formChange
          asReportingRequirement {
            reportDueDate
          }
        }
        projectFundingAgreementFormChanges: formChangesFor(
          first: 500
          formDataTableName: "funding_parameter"
          filter: { operation: { notEqualTo: ARCHIVE } }
        ) @connection(key: "connection_projectFundingAgreementFormChanges") {
          __id
          edges {
            node {
              id
              newFormData
            }
          }
        }
        emissionIntensityReportFormChanges: formChangesFor(
          first: 500
          formDataTableName: "reporting_requirement"
          reportType: "TEIMP"
          filter: { operation: { notEqualTo: ARCHIVE } }
        ) @connection(key: "connection_emissionIntensityReportFormChanges") {
          edges {
            node {
              id
              newFormData
            }
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

  const [addQuarterlyReportMutation, isAdding] =
    useAddReportingRequirementToRevision();

  const [applyUpdateFormChangeMutation, isUpdating] =
    useUpdateReportingRequirementFormChange();

  const [applyStageFormChangeMutation, isStaging] =
    useStageReportingRequirementFormChange();

  const [discardFormChange] = useDiscardReportingRequirementFormChange(
    "Quarterly",
    projectRevision.projectQuarterlyReportFormChanges.__id
  );
  const [generateQuarterlyReports, isGenerating] =
    useGenerateQuarterlyReports();

  const [sortedQuarterlyReports, nextQuarterlyReportIndex] = useMemo(() => {
    return getSortedReports(
      projectRevision.projectQuarterlyReportFormChanges.edges
    );
  }, [projectRevision.projectQuarterlyReportFormChanges]);

  // Get all form changes ids to get used in the undo changes button
  const formChangeIds = useMemo(() => {
    return projectRevision.projectQuarterlyReportFormChanges.edges.map(
      ({ node }) => node?.rowId
    );
  }, [projectRevision.projectQuarterlyReportFormChanges]);

  const upcomingReportDueDate =
    projectRevision.upcomingQuarterlyReportFormChange?.asReportingRequirement
      .reportDueDate;

  const reportSubmittedDates = useMemo(() => {
    return projectRevision.projectQuarterlyReportFormChanges.edges.map(
      ({ node }) => node.newFormData.submittedDate
    );
  }, [projectRevision.projectQuarterlyReportFormChanges.edges]);

  const projectFundingAgreementFormChange =
    projectRevision.projectFundingAgreementFormChanges.edges[0]?.node;

  const emissionIntensityReportFormChange =
    projectRevision.emissionIntensityReportFormChanges.edges[0]?.node;

  const upcomingReportFormChange =
    projectRevision.upcomingQuarterlyReportFormChange;

  const indexOfNextAnnualReport =
    sortedQuarterlyReports.findIndex(
      (x) => x.id === upcomingReportFormChange?.id
    ) + 1;

  return (
    <div>
      <header>
        <h2>Quarterly Reports</h2>
        <UndoChangesButton formChangeIds={formChangeIds} formRefs={formRefs} />
        <SavingIndicator isSaved={!isUpdating && !isAdding && !isStaging} />
      </header>
      <h3>Status</h3>
      <Status
        upcomingReportDueDate={upcomingReportDueDate}
        reportSubmittedDates={reportSubmittedDates}
        reportType={"Quarterly"}
      />
      <ReportDueIndicator
        reportTitle="Quarterly Report"
        reportDueFormChange={projectRevision.upcomingQuarterlyReportFormChange}
        renderingIndex={indexOfNextAnnualReport}
      />
      <FormBorder>
        <ReportGenerator
          revisionId={projectRevision.rowId}
          reportType="Quarterly"
          startDateObject={{
            id: projectFundingAgreementFormChange?.id,
            label: "Contract Start Date",
            inputName: "contractStartDate",
            date: projectFundingAgreementFormChange?.newFormData
              ?.contractStartDate,
          }}
          endDateObject={{
            id: emissionIntensityReportFormChange?.id,
            label: "TEIMP End Date",
            inputName: "measurementPeriodEndDate",
            date: emissionIntensityReportFormChange?.newFormData
              ?.measurementPeriodEndDate,
          }}
          mutationFunction={generateQuarterlyReports}
          isGenerating={isGenerating}
          hasReports={sortedQuarterlyReports.length !== 0}
        />
        <Button
          variant="secondary"
          onClick={() =>
            addReportFormChange(
              addQuarterlyReportMutation,
              projectRevision,
              nextQuarterlyReportIndex,
              "Quarterly",
              projectRevision.projectQuarterlyReportFormChanges.__id
            )
          }
          className="addButton"
        >
          <FontAwesomeIcon icon={faPlusCircle} /> Add Another Quarterly Report
        </Button>

        {sortedQuarterlyReports.map((quarterlyReport, index) => {
          return (
            <div key={quarterlyReport.id}>
              <CollapsibleReport
                title={`Quarterly Report ${index + 1}`}
                reportingRequirement={quarterlyReport.asReportingRequirement}
              >
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() =>
                    deleteReportFormChange(
                      discardFormChange,
                      quarterlyReport.id,
                      quarterlyReport.rowId,
                      quarterlyReport.operation,
                      formRefs
                    )
                  }
                  className="removeButton"
                >
                  Remove
                </Button>
                <FormBase
                  id={`form-${quarterlyReport.id}`}
                  validateOnMount={quarterlyReport.changeStatus === "staged"}
                  idPrefix={`form-${quarterlyReport.id}`}
                  ref={(el) =>
                    el && (formRefs.current[quarterlyReport.id] = el)
                  }
                  formData={quarterlyReport.newFormData}
                  onChange={(change) => {
                    updateReportFormChange(
                      applyUpdateFormChangeMutation,
                      "Quarterly",
                      { ...quarterlyReport },
                      change.formData
                    );
                  }}
                  schema={
                    quarterlyReport.formByJsonSchemaName.jsonSchema
                      .schema as JSONSchema7
                  }
                  uiSchema={reportingRequirementUiSchema}
                  ObjectFieldTemplate={EmptyObjectFieldTemplate}
                  formContext={{
                    dueDate: quarterlyReport.newFormData?.reportDueDate,
                  }}
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
            applyStageFormChangeMutation,
            props.onSubmit,
            formRefs,
            projectRevision.projectQuarterlyReportFormChanges.edges,
            "Quarterly"
          )
        }
        disabled={isUpdating || isStaging}
      >
        Submit Quarterly Reports
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

export default ProjectQuarterlyReportForm;
