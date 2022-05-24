import { Button } from "@button-inc/bcgov-theme";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReportDueIndicator from "components/ReportingRequirement/ReportDueIndicator";
import projectReportingRequirementSchema from "data/jsonSchemaForm/projectReportingRequirementSchema";
import useDiscardFormChange from "hooks/useDiscardFormChange";
import { JSONSchema7 } from "json-schema";
import validateFormWithErrors from "lib/helpers/validateFormWithErrors";
import FormBorder from "lib/theme/components/FormBorder";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import { useAddReportingRequirementToRevision } from "mutations/ProjectReportingRequirement/addReportingRequirementToRevision.ts";
import { useUpdateReportingRequirementFormChange } from "mutations/ProjectReportingRequirement/updateReportingRequirementFormChange";
import { useMemo, useRef } from "react";
import { graphql, useFragment } from "react-relay";
import { FormChangeOperation } from "__generated__/ProjectContactForm_projectRevision.graphql";
import { ProjectQuarterlyReportForm_projectRevision$key } from "__generated__/ProjectQuarterlyReportForm_projectRevision.graphql";
import FormBase from "./FormBase";
import SavingIndicator from "./SavingIndicator";

interface Props {
  onSubmit: () => void;
  projectRevision: ProjectQuarterlyReportForm_projectRevision$key;
}

const quarterlyReportUiSchema = {
  reportDueDate: {
    "ui:col-md": 12,
    "bcgov:size": "small",
    "ui:widget": "date",
  },
  submittedDate: {
    "ui:col-md": 12,
    "bcgov:size": "small",
    "ui:widget": "date",
  },
  comments: {
    "ui:col-md": 12,
    "bcgov:size": "small",
    "ui:widget": "TextAreaWidget",
  },
};

const ProjectQuarterlyReportForm: React.FC<Props> = (props) => {
  const formRefs = useRef({});

  const projectRevision = useFragment(
    graphql`
      fragment ProjectQuarterlyReportForm_projectRevision on ProjectRevision {
        id
        rowId
        projectQuarterlyReportFormChanges(first: 502)
          @connection(key: "connection_projectQuarterlyReportFormChanges") {
          __id
          edges {
            node {
              rowId
              id
              newFormData
              operation
              changeStatus
              formChangeByPreviousFormChangeId {
                changeStatus
                newFormData
              }
            }
          }
        }
        upcomingReportingRequirementFormChange(reportType: "Quarterly") {
          ...ReportDueIndicator_formChange
        }
        projectFormChange {
          formDataRecordId
        }
      }
    `,
    props.projectRevision
  );

  const [addQuarterlyReportMutation, isAdding] =
    useAddReportingRequirementToRevision();

  const addQuarterlyReport = (reportIndex: number) => {
    const formData = {
      status: "on_track",
      projectId: projectRevision.projectFormChange.formDataRecordId,
      reportType: "Quarterly",
      reportingRequirementIndex: reportIndex,
    };
    addQuarterlyReportMutation({
      variables: {
        projectRevisionId: projectRevision.rowId,
        newFormData: formData,
        connections: [projectRevision.projectQuarterlyReportFormChanges.__id],
      },
    });
  };

  const [applyUpdateFormChangeMutation, isUpdating] =
    useUpdateReportingRequirementFormChange();

  const updateFormChange = (
    formChange: {
      readonly id: string;
      readonly newFormData: any;
      readonly operation: FormChangeOperation;
      readonly changeStatus: string;
    },
    newFormData: any
  ) => {
    applyUpdateFormChangeMutation({
      variables: {
        input: {
          id: formChange.id,
          formChangePatch: {
            newFormData,
            changeStatus: formChange.changeStatus,
          },
        },
        reportType: "Quarterly",
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

  const [discardFormChange] = useDiscardFormChange(
    projectRevision.projectQuarterlyReportFormChanges.__id
  );

  const deleteQuarterlyReport = (
    formChangeId: string,
    formChangeOperation: FormChangeOperation
  ) => {
    discardFormChange({
      formChange: { id: formChangeId, operation: formChangeOperation },
      onCompleted: () => {
        delete formRefs.current[formChangeId];
      },
    });
  };

  const stageQuarterlyReportFormChanges = async () => {
    const validationErrors = Object.keys(formRefs.current).reduce(
      (agg, formId) => {
        const formObject = formRefs.current[formId];
        return [...agg, ...validateFormWithErrors(formObject)];
      },
      []
    );

    const completedPromises: Promise<void>[] = [];

    projectRevision.projectQuarterlyReportFormChanges.edges.forEach(
      ({ node }) => {
        if (node.changeStatus === "pending") {
          const promise = new Promise<void>((resolve, reject) => {
            applyUpdateFormChangeMutation({
              variables: {
                input: {
                  id: node.id,
                  formChangePatch: {
                    changeStatus: "staged",
                  },
                },
                reportType: "Quarterly",
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
      }
    );
    try {
      await Promise.all(completedPromises);

      if (validationErrors.length === 0) props.onSubmit();
    } catch (e) {
      // the failing mutation will display an error message and send the error to sentry
    }
  };

  const [sortedQuarterlyReports, nextQuarterlyReportIndex] = useMemo(() => {
    const filteredReports =
      projectRevision.projectQuarterlyReportFormChanges.edges
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
  }, [projectRevision.projectQuarterlyReportFormChanges]);

  return (
    <div>
      <header>
        <h2>Quarterly Reports</h2>
        <SavingIndicator isSaved={!isUpdating && !isAdding} />
      </header>

      <ReportDueIndicator
        reportTitle="Quarterly Report"
        reportDueFormChange={
          projectRevision.upcomingReportingRequirementFormChange
        }
      />

      <FormBorder>
        <Button
          variant="secondary"
          onClick={() => addQuarterlyReport(nextQuarterlyReportIndex)}
          className="addButton"
        >
          <FontAwesomeIcon icon={faPlusCircle} /> Add another quarterly report
        </Button>

        {sortedQuarterlyReports.map((quarterlyReport, index) => {
          return (
            <div key={quarterlyReport.id} className="reportContainer">
              <header className="reportHeader">
                <h3>Quarterly Report {index + 1}</h3>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() =>
                    deleteQuarterlyReport(
                      quarterlyReport.id,
                      quarterlyReport.operation
                    )
                  }
                >
                  Remove
                </Button>
              </header>
              <FormBase
                id={`form-${quarterlyReport.id}`}
                idPrefix={`form-${quarterlyReport.id}`}
                ref={(el) => (formRefs.current[quarterlyReport.id] = el)}
                formData={quarterlyReport.newFormData}
                onChange={(change) => {
                  updateFormChange(
                    { ...quarterlyReport, changeStatus: "pending" },
                    change.formData
                  );
                }}
                schema={projectReportingRequirementSchema as JSONSchema7}
                uiSchema={quarterlyReportUiSchema}
                ObjectFieldTemplate={EmptyObjectFieldTemplate}
              />
            </div>
          );
        })}
      </FormBorder>
      <Button
        size="medium"
        variant="primary"
        onClick={stageQuarterlyReportFormChanges}
        disabled={isUpdating}
      >
        Submit Quarterly Reports
      </Button>

      <style jsx>{`
        div :global(button.pg-button) {
          margin-left: 0.4em;
          margin-right: 0em;
        }
        div.reportContainer {
          border-top: 1px solid black;
          padding-top: 1em;
        }
        div :global(button.addButton) {
          margin-bottom: 1em;
        }
        header.reportHeader {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
        }
      `}</style>
    </div>
  );
};

export default ProjectQuarterlyReportForm;
