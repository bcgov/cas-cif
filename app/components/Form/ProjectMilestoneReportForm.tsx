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
import { ProjectMilestoneReportForm_projectRevision$key } from "__generated__/ProjectMilestoneReportForm_projectRevision.graphql";
import FormBase from "./FormBase";
import SavingIndicator from "./SavingIndicator";

interface Props {
  onSubmit: () => void;
  projectRevision: ProjectMilestoneReportForm_projectRevision$key;
}

const milestoneReportUiSchema = {
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

const ProjectMilestoneReportForm: React.FC<Props> = (props) => {
  const formRefs = useRef({});

  const projectRevision = useFragment(
    // The JSON string is tripping up eslint
    // eslint-disable-next-line relay/graphql-syntax
    graphql`
      fragment ProjectMilestoneReportForm_projectRevision on ProjectRevision {
        id
        rowId
        milestoneReportFormChanges: formChangesFor(
          first: 1000
          formDataTableName: "reporting_requirement"
          jsonMatcher: "{\"reportType\":\"Milestone\"}"
        )
          @connection(key: "connection_milestoneReportFormChanges") {
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
  const [addMilestoneReportMutation, isAdding] =
    useAddReportingRequirementToRevision();

  const addMilestoneReport = (reportIndex: number) => {
    const formData = {
      status: "on_track",
      projectId: projectRevision.projectFormChange.formDataRecordId,
      reportType: "Milestone",
      reportingRequirementIndex: reportIndex,
    };
    addMilestoneReportMutation({
      variables: {
        projectRevisionId: projectRevision.rowId,
        newFormData: formData,
        connections: [projectRevision.milestoneFormChanges.__id],
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
    projectRevision.milestoneFormChanges.__id
  );

  const deleteMilestoneReport = (
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

  const stageMilestoneReportFormChanges = async () => {
    const validationErrors = Object.keys(formRefs.current).reduce(
      (agg, formId) => {
        const formObject = formRefs.current[formId];
        return [...agg, ...validateFormWithErrors(formObject)];
      },
      []
    );

    const completedPromises: Promise<void>[] = [];

    projectRevision.milestoneFormChanges.edges.forEach(({ node }) => {
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

  const [sortedMilestoneReports, nextMilestoneReportIndex] = useMemo(() => {
    const filteredReports = projectRevision.milestoneFormChanges.edges
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
  }, [projectRevision.milestoneFormChanges]);

  return (
    <div>
      <header>
        <h2>Milestone Reports</h2>
        <SavingIndicator isSaved={!isUpdating && !isAdding} />
      </header>

      <div>Milestone reports status here</div>

      <FormBorder>
        <Button
          variant="secondary"
          onClick={() => addMilestoneReport(nextMilestoneReportIndex)}
          className="addButton"
        >
          <FontAwesomeIcon icon={faPlusCircle} /> Add another milestone report
        </Button>

        {sortedMilestoneReports.map((milestoneReport, index) => {
          return (
            <div key={milestoneReport.id} className="reportContainer">
              <header className="reportHeader">
                <h3>Milestone Report {index + 1}</h3>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() =>
                    deleteMilestoneReport(
                      milestoneReport.id,
                      milestoneReport.operation
                    )
                  }
                >
                  Remove
                </Button>
              </header>
              <FormBase
                id={`form-${milestoneReport.id}`}
                idPrefix={`form-${milestoneReport.id}`}
                ref={(el) => (formRefs.current[milestoneReport.id] = el)}
                formData={milestoneReport.newFormData}
                onChange={(change) => {
                  updateFormChange(
                    { ...milestoneReport, changeStatus: "pending" },
                    change.formData
                  );
                }}
                schema={projectReportingRequirementSchema as JSONSchema7}
                uiSchema={milestoneReportUiSchema}
                ObjectFieldTemplate={EmptyObjectFieldTemplate}
              />
            </div>
          );
        })}
      </FormBorder>
      <Button
        size="medium"
        variant="primary"
        onClick={stageMilestoneReportFormChanges}
        disabled={isUpdating}
      >
        Submit Milestone Reports
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

export default ProjectMilestoneReportForm;
