import { Button } from "@button-inc/bcgov-theme";
import { faCheck, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CollapsibleReport from "components/ReportingRequirement/CollapsibleReport";
import ReportDueIndicator from "components/ReportingRequirement/ReportDueIndicator";
import Status from "components/ReportingRequirement/Status";
import {
  milestoneReportingRequirementUiSchema,
  milestoneReportingRequirementSchema,
  milestoneSchema,
  milestoneUiSchema,
} from "data/jsonSchemaForm/projectMilestoneSchema";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import FormBorder from "lib/theme/components/FormBorder";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
// import { useUpdateReportingRequirementFormChange } from "mutations/ProjectReportingRequirement/updateReportingRequirementFormChange";
import { useRouter } from "next/router";
import { MutableRefObject, useEffect, useMemo, useRef } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectMilestoneReportForm_projectRevision$key } from "__generated__/ProjectMilestoneReportForm_projectRevision.graphql";
import { ProjectMilestoneReportForm_query$key } from "__generated__/ProjectMilestoneReportForm_query.graphql";
import FormBase from "./FormBase";
// import {
//   stageReportFormChanges,
//   updateReportFormChange,
// } from "./reportingRequirementFormChangeFunctions";
import SavingIndicator from "./SavingIndicator";
import UndoChangesButton from "./UndoChangesButton";
import { useAddMilestoneToRevision } from "mutations/MilestoneReport/addMilestoneToRevision";
import useDiscardMilestoneFormChange from "mutations/MilestoneReport/discardMilestoneFormChange";

interface Props {
  onSubmit: () => void;
  projectRevision: ProjectMilestoneReportForm_projectRevision$key;
  query: ProjectMilestoneReportForm_query$key;
}

export const createMilestoneReportingRequirementSchema = (allReportTypes) => {
  const schema = milestoneReportingRequirementSchema;
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
  return schema as JSONSchema7;
};

export const createMilestoneSchema = () => {
  const schema = milestoneSchema;
  schema.properties.certifierProfessionalDesignation = {
    ...schema.properties.certifierProfessionalDesignation,
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
        milestoneReportingRequirementFormChanges: formChangesFor(
          formDataTableName: "reporting_requirement"
          reportType: "Milestone"
          first: 1000
        )
          @connection(
            key: "connection_milestoneReportingRequirementFormChanges"
          ) {
          edges {
            node {
              id
              rowId
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
    const consolidatedFormDataArray = [];
    let consolidatedFormDataObject = {} as any;

    projectRevision.milestoneReportingRequirementFormChanges.edges.forEach(
      (reportingRequirement) => {
        consolidatedFormDataObject.reportingRequirementFormChange =
          reportingRequirement.node;
        // We simulate a node object here for each array item to allow the getSortedReports() function to sort this consolidated data
        consolidatedFormDataObject.operation =
          reportingRequirement.node.operation;
        consolidatedFormDataObject.reportingRequirementIndex =
          reportingRequirement.node.newFormData.reportingRequirementIndex;
        consolidatedFormDataObject.milestoneFormChange =
          projectRevision.milestoneFormChanges.edges.find(
            ({ node }) =>
              reportingRequirement.node.formDataRecordId ===
              node.newFormData?.reportingRequirementId
          );
        consolidatedFormDataObject.paymentFormChange =
          projectRevision.milestonePaymentFormChanges.edges.find(
            ({ node }) =>
              reportingRequirement.node.formDataRecordId ===
              node.newFormData?.reportingRequirementId
          );
        consolidatedFormDataArray.push(consolidatedFormDataObject);
      }
    );
    return consolidatedFormDataArray;
  }, [projectRevision]);

  const generatedReportingRequirementSchema = useMemo(() => {
    return createMilestoneReportingRequirementSchema(query.allReportTypes);
  }, [query.allReportTypes]);

  const generatedMilestoneSchema = useMemo(() => {
    return createMilestoneSchema();
  }, []);

  const [addMilestoneReportMutation, isAdding] = useAddMilestoneToRevision();

  // const [applyUpdateFormChangeMutation, isUpdating] =
  //   useUpdateReportingRequirementFormChange();

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
            <div key={milestoneReport.reportingRequirementFormChange.id}>
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
                          reportingRequirementIndex: index + 1,
                        },
                        reportType: "Milestone",
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
                    console.log(change);
                    // updateReportFormChange(
                    //   applyUpdateFormChangeMutation,
                    //   "Milestone",
                    //   { ...milestoneReport, changeStatus: "pending" },
                    //   change.formData
                    // );
                  }}
                  schema={generatedReportingRequirementSchema as JSONSchema7}
                  uiSchema={milestoneReportingRequirementUiSchema}
                  ObjectFieldTemplate={EmptyObjectFieldTemplate}
                  formContext={{
                    dueDate:
                      milestoneReport.reportingRequirementFormChange.newFormData
                        ?.reportDueDate,
                  }}
                />
                <FormBase
                  id={`form-${milestoneReport.milestoneFormChange.id}`}
                  // validateOnMount={milestoneReport.milestoneFormChange.changeStatus === "staged"}
                  // idPrefix={`form-${milestoneReport.milestoneFormChange.id}`}
                  // ref={(el) => (formRefs.current[milestoneReport.milestoneFormChange.id] = el)}
                  formData={milestoneReport.milestoneFormChange.newFormData}
                  onChange={(change) => {
                    console.log(change);
                    // updateReportFormChange(
                    //   applyUpdateFormChangeMutation,
                    //   "Milestone",
                    //   { ...milestoneReport, changeStatus: "pending" },
                    //   change.formData
                    // );
                  }}
                  // schema={generatedReportingRequirementSchema as JSONSchema7}
                  // uiSchema={milestoneReportingRequirementUiSchema}
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
        onClick={
          () => console.log("I am staging")
          // stageReportFormChanges(
          //   applyUpdateFormChangeMutation,
          //   "General Milestone",
          //   props.onSubmit,
          //   formRefs,
          //   projectRevision.milestoneReportingRequirementFormChanges.edges
          // )
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
