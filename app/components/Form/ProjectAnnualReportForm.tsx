import { Button } from "@button-inc/bcgov-theme";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import projectReportingRequirementSchema from "data/jsonSchemaForm/projectReportingRequirementSchema";
import useDiscardFormChange from "hooks/useDiscardFormChange";
import { JSONSchema7 } from "json-schema";
import FormBorder from "lib/theme/components/FormBorder";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import { useAddReportingRequirementToRevision } from "mutations/ProjectReportingRequirement/addReportingRequirementToRevision.ts";
import { useUpdateReportingRequirementFormChange } from "mutations/ProjectReportingRequirement/updateReportingRequirementFormChange";
import { useMemo, useRef } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectAnnualReportForm_projectRevision$key } from "__generated__/ProjectAnnualReportForm_projectRevision.graphql";
import FormBase from "./FormBase";
import SavingIndicator from "./SavingIndicator";
import {
  addReportFormChange,
  updateReportFormChange,
  deleteReportFormChange,
  stageReportFormChanges,
  getSortedReports,
} from "./reportingRequirementFormChangeFunctions";

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

  const [applyUpdateFormChangeMutation, isUpdating] =
    useUpdateReportingRequirementFormChange();

  const [discardFormChange] = useDiscardFormChange(
    projectRevision.projectAnnualReportFormChanges.__id
  );

  const [sortedAnnualReports, nextAnnualReportIndex] = useMemo(() => {
    return getSortedReports(
      projectRevision.projectAnnualReportFormChanges.edges
    );
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
          onClick={() =>
            addReportFormChange(
              addAnnualReportMutation,
              projectRevision,
              nextAnnualReportIndex,
              "Annual",
              projectRevision.projectAnnualReportFormChanges.__id
            )
          }
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
                    deleteReportFormChange(
                      discardFormChange,
                      report.id,
                      report.operation,
                      formRefs
                    )
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
                  updateReportFormChange(
                    applyUpdateFormChangeMutation,
                    { ...report, changeStatus: "pending" },
                    change.formData
                  );
                }}
                schema={projectReportingRequirementSchema as JSONSchema7}
                uiSchema={annualReportUiSchema}
                ObjectFieldTemplate={EmptyObjectFieldTemplate}
                formContext={{
                  dueDate: report.newFormData?.reportDueDate,
                }}
              />
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
            projectRevision.projectAnnualReportFormChanges.edges
          )
        }
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
