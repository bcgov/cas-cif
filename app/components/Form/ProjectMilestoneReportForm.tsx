import { Button } from "@button-inc/bcgov-theme";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  projectMilestoneSchema,
  milestoneReportUiSchema,
} from "data/jsonSchemaForm/projectMilestoneSchema";
import useDiscardReportingRequirementFormChange from "mutations/ProjectReportingRequirement/discardReportingRequirementFormChange";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import FormBorder from "lib/theme/components/FormBorder";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import { useAddReportingRequirementToRevision } from "mutations/ProjectReportingRequirement/addReportingRequirementToRevision.ts";
import { useUpdateReportingRequirementFormChange } from "mutations/ProjectReportingRequirement/updateReportingRequirementFormChange";
import { MutableRefObject, useEffect, useMemo, useRef } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectMilestoneReportForm_projectRevision$key } from "__generated__/ProjectMilestoneReportForm_projectRevision.graphql";
import { ProjectMilestoneReportForm_query$key } from "__generated__/ProjectMilestoneReportForm_query.graphql";
import FormBase from "./FormBase";
import SavingIndicator from "./SavingIndicator";
import {
  addReportFormChange,
  updateReportFormChange,
  deleteReportFormChange,
  stageReportFormChanges,
  getSortedReports,
} from "./reportingRequirementFormChangeFunctions";
import { useRouter } from "next/router";
import UndoChangesButton from "./UndoChangesButton";

interface Props {
  onSubmit: () => void;
  projectRevision: ProjectMilestoneReportForm_projectRevision$key;
  query: ProjectMilestoneReportForm_query$key;
}

export const createProjectMilestoneSchema = (allReportTypes) => {
  const schema = projectMilestoneSchema;
  schema.properties.reportType = {
    ...schema.properties.reportType,
    anyOf: allReportTypes.edges.map(({ node }) => {
      const replaceRegex = /\sMilestone/i;
      const displayValue = node.name.replace(replaceRegex, "");
      return {
        type: "string",
        title: displayValue,
        enum: [node.name],
        value: node.name,
      } as JSONSchema7Definition;
    }),
    default: "General Milestone",
  };
  schema.properties.certifiedByProfessionalDesignation = {
    ...schema.properties.certifiedByProfessionalDesignation,
    anyOf: ["Professional Engineer", "Certified Professional Accountant"].map(
      (designation) => {
        return {
          type: "string",
          title: designation,
          enum: [designation],
          value: designation,
        } as JSONSchema7Definition;
      }
    ),
  };

  return schema as JSONSchema7;
};

const ProjectMilestoneReportForm: React.FC<Props> = (props) => {
  const formRefs: MutableRefObject<{}> = useRef({});
  const router = useRouter();

  const projectRevision = useFragment(
    graphql`
      fragment ProjectMilestoneReportForm_projectRevision on ProjectRevision {
        id
        # eslint-disable-next-line relay/unused-fields
        rowId
        projectMilestoneReportFormChanges: formChangesFor(
          formDataTableName: "reporting_requirement"
          reportType: "Milestone"
          first: 1000
        ) @connection(key: "connection_projectMilestoneReportFormChanges") {
          __id
          edges {
            node {
              id
              rowId
              newFormData
              operation
              changeStatus
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

  const query = useFragment(
    graphql`
      fragment ProjectMilestoneReportForm_query on Query {
        allReportTypes(filter: { name: { notIn: ["Quarterly", "Annual"] } }) {
          edges {
            node {
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
  }, [router.query.anchor]);

  const milestoneSchema = useMemo(() => {
    return createProjectMilestoneSchema(query.allReportTypes);
  }, [query.allReportTypes]);

  const [addMilestoneReportMutation, isAdding] =
    useAddReportingRequirementToRevision();

  const [applyUpdateFormChangeMutation, isUpdating] =
    useUpdateReportingRequirementFormChange();

  const [discardFormChange] = useDiscardReportingRequirementFormChange(
    "milestone",
    projectRevision.projectMilestoneReportFormChanges.__id
  );

  const [sortedMilestoneReports, nextMilestoneReportIndex] = useMemo(() => {
    return getSortedReports(
      projectRevision.projectMilestoneReportFormChanges.edges
    );
  }, [projectRevision.projectMilestoneReportFormChanges]);

  // Get all form changes ids to get used in the undo changes button
  const formChangeIds = useMemo(() => {
    return projectRevision.projectMilestoneReportFormChanges.edges.map(
      ({ node }) => node?.rowId
    );
  }, [projectRevision.projectMilestoneReportFormChanges]);

  return (
    <div>
      <header id={`Milestone0`}>
        <h2>Milestone Reports</h2>
        <UndoChangesButton formChangeIds={formChangeIds} formRefs={formRefs} />
        <SavingIndicator isSaved={!isUpdating && !isAdding} />
      </header>

      <div>Milestone reports status here</div>

      <FormBorder>
        <Button
          variant="secondary"
          onClick={() =>
            addReportFormChange(
              addMilestoneReportMutation,
              projectRevision,
              nextMilestoneReportIndex,
              "General Milestone",
              projectRevision.projectMilestoneReportFormChanges.__id
            )
          }
          className="addButton"
        >
          <FontAwesomeIcon icon={faPlusCircle} /> Add another milestone report
        </Button>

        {sortedMilestoneReports.map((milestoneReport, index) => {
          return (
            <div
              id={`Milestone${index + 1}`}
              key={milestoneReport.id}
              className="reportContainer"
            >
              <header className="reportHeader">
                <h3>Milestone {index + 1}</h3>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() =>
                    deleteReportFormChange(
                      discardFormChange,
                      milestoneReport.id,
                      milestoneReport.operation,
                      formRefs
                    )
                  }
                >
                  Remove
                </Button>
              </header>
              <FormBase
                id={`form-${milestoneReport.id}`}
                validateOnMount={milestoneReport.changeStatus === "staged"}
                idPrefix={`form-${milestoneReport.id}`}
                ref={(el) => (formRefs.current[milestoneReport.id] = el)}
                formData={milestoneReport.newFormData}
                onChange={(change) => {
                  updateReportFormChange(
                    applyUpdateFormChangeMutation,
                    "General Milestone",
                    { ...milestoneReport, changeStatus: "pending" },
                    change.formData
                  );
                }}
                schema={milestoneSchema as JSONSchema7}
                uiSchema={milestoneReportUiSchema}
                ObjectFieldTemplate={EmptyObjectFieldTemplate}
                formContext={{
                  dueDate: milestoneReport.newFormData?.reportDueDate,
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
            "General Milestone",
            props.onSubmit,
            formRefs,
            projectRevision.projectMilestoneReportFormChanges.edges
          )
        }
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
