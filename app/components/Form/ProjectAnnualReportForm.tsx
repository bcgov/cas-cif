import { Button } from "@button-inc/bcgov-theme";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
import { ProjectAnnualReportForm_projectRevision$key } from "__generated__/ProjectAnnualReportForm_projectRevision.graphql";
import FormBase from "./FormBase";
import SavingIndicator from "./SavingIndicator";

interface Props {
  onSubmit: () => void;
  projectRevision: ProjectAnnualReportForm_projectRevision$key;
}

const annualReportUiSchema = {
  reportDueDate: {
    "ui:widget": "DueDateWidget",
  },
  submittedDate: {
    "ui:widget": "ReceivedDateWidget",
  },
  comments: {
    "ui:widget": "TextAreaWidget",
  },
};

const ProjectAnnualReportForm: React.FC<Props> = (props) => {
  const formRefs = useRef({});

  const projectRevision = useFragment(
    graphql`
      fragment ProjectAnnualReportForm_projectRevision on ProjectRevision {
        id
        rowId
        projectAnnualReportFormChanges(first: 502)
          @connection(key: "connection_projectAnnualReportFormChanges") {
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
        projectFormChange {
          formDataRecordId
        }
      }
    `,
    props.projectRevision
  );
  const [addAnnualReportMutation, isAdding] =
    useAddReportingRequirementToRevision();

  const addAnnualReport = (reportIndex: number) => {
    const formData = {
      status: "on_track",
      projectId: projectRevision.projectFormChange.formDataRecordId,
      reportType: "Annual",
      reportingRequirementIndex: reportIndex,
    };
    addAnnualReportMutation({
      variables: {
        projectRevisionId: projectRevision.rowId,
        newFormData: formData,
        connections: [projectRevision.projectAnnualReportFormChanges.__id],
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
        reportType: "Annual",
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
    projectRevision.projectAnnualReportFormChanges.__id
  );

  const deleteAnnualReport = (
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

  const stageAnnualReportFormChanges = async () => {
    const validationErrors = Object.keys(formRefs.current).reduce(
      (agg, formId) => {
        const formObject = formRefs.current[formId];
        return [...agg, ...validateFormWithErrors(formObject)];
      },
      []
    );

    const completedPromises: Promise<void>[] = [];

    projectRevision.projectAnnualReportFormChanges.edges.forEach(({ node }) => {
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
              reportType: "Annual",
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

      if (validationErrors.length === 0) props.onSubmit();
    } catch (e) {
      // the failing mutation will display an error message and send the error to sentry
    }
  };

  const [sortedAnnualReports, nextAnnualReportIndex] = useMemo(() => {
    const filteredAnnualReports =
      projectRevision.projectAnnualReportFormChanges.edges
        .map(({ node }) => node)
        .filter((annualReport) => annualReport.operation !== "ARCHIVE");

    filteredAnnualReports.sort(
      (a, b) =>
        a.newFormData.reportingRequirementIndex -
        b.newFormData.reportingRequirementIndex
    );
    const nextIndex =
      filteredAnnualReports.length > 0
        ? filteredAnnualReports[filteredAnnualReports.length - 1].newFormData
            .reportingRequirementIndex + 1
        : 1;

    return [filteredAnnualReports, nextIndex];
  }, [projectRevision.projectAnnualReportFormChanges]);

  return (
    <div>
      <header>
        <h2>Annual Reports</h2>
        <SavingIndicator isSaved={!isUpdating && !isAdding} />
      </header>

      <div>Annual reports status here</div>

      <FormBorder>
        <Button
          variant="secondary"
          onClick={() => addAnnualReport(nextAnnualReportIndex)}
          className="addButton"
        >
          <FontAwesomeIcon icon={faPlusCircle} /> Add another annual report
        </Button>

        {sortedAnnualReports.map((report, index) => {
          return (
            <div key={report.id} className="reportContainer">
              <header className="reportHeader">
                <h3>Annual Report {index + 1}</h3>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() =>
                    deleteAnnualReport(report.id, report.operation)
                  }
                >
                  Remove
                </Button>
              </header>
              <FormBase
                id={`form-${report.id}`}
                idPrefix={`form-${report.id}`}
                ref={(el) => (formRefs.current[report.id] = el)}
                formData={report.newFormData}
                onChange={(change) => {
                  updateFormChange(
                    { ...report, changeStatus: "pending" },
                    change.formData
                  );
                }}
                schema={projectReportingRequirementSchema as JSONSchema7}
                uiSchema={annualReportUiSchema}
                ObjectFieldTemplate={EmptyObjectFieldTemplate}
              />
            </div>
          );
        })}
      </FormBorder>
      <Button
        size="medium"
        variant="primary"
        onClick={stageAnnualReportFormChanges}
        disabled={isUpdating}
      >
        Submit Annual Reports
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

export default ProjectAnnualReportForm;
