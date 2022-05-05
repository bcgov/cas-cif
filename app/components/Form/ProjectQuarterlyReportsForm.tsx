import { Button } from "@button-inc/bcgov-theme";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import Grid from "@button-inc/bcgov-theme/Grid";
import FormBorder from "lib/theme/components/FormBorder";
import quarterlyReports from "pages/cif/project-revision/[projectRevision]/form/quarterly-reports";
import { useMemo, useRef } from "react";
import { graphql, useFragment } from "react-relay";
import quarterlyReportSchema from "data/jsonSchemaForm/quarterlyReportSchema";
import { ProjectQuarterlyReportsForm_projectRevision$key } from "__generated__/ProjectQuarterlyReportsForm_projectRevision.graphql";
import { ProjectQuarterlyReportsForm_query$key } from "__generated__/ProjectQuarterlyReportsForm_query.graphql";
import SavingIndicator from "./SavingIndicator";
import { useUpdateProjectContactFormChange } from "mutations/ProjectContact/updateProjectContactFormChange";
import useDiscardFormChange from "hooks/useDiscardFormChange";
import FormBase from "./FormBase";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { useAddReportingRequirementToRevision } from "mutations/ProjectReportingRequirement/addReportingRequirementToRevision.ts";

interface Props {
  onSubmit: () => void;
  projectRevision: ProjectQuarterlyReportsForm_projectRevision$key;
}

const quarterlyReportUiSchema = {
  dueDate: {
    "ui:col-md": 12,
    "bcgov:size": "small",
  },
  submittedDate: {
    "ui:col-md": 12,
    "bcgov:size": "small",
  },
  comments: {
    "ui:col-md": 12,
    "bcgov:size": "small",
  },
};

const ProjectQuarterlyReportsForm: React.FC<Props> = (props) => {
  const formRefs = useRef({});

  const projectRevision = useFragment(
    graphql`
      fragment ProjectQuarterlyReportsForm_projectRevision on ProjectRevision {
        id
        rowId
        projectQuarterlyReportFormChanges(first: 502)
          @connection(key: "connection_projectQuarterlyReportFormChanges") {
          __id
          edges {
            node {
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

  console.log(projectRevision);

  //brianna --do we need an all forms like ProjectContactForm? That one uses primary/secondary

  ///////////mutations to-do:
  const [addQuarterlyReportMutation, isAdding] =
    useAddReportingRequirementToRevision();

  const addQuarterlyReport = (newFormData: any) => {
    const formData = {
      ...newFormData,
      status: "on_track",
      projectId: projectRevision.projectFormChange.formDataRecordId,
      reportType: "Quarterly",
    };

    addQuarterlyReportMutation({
      variables: {
        projectRevisionId: projectRevision.rowId,
        newFormData: formData,
        connections: [projectRevision.projectQuarterlyReportFormChanges.__id], //brianna what will this be
      },
      // optimisticResponse: {
      //   createFormChange: {
      //     query: {
      //       projectRevision: {
      //         projectFormChange: undefined,
      //         projectQuarterlyReportFormChanges: {
      //           edges:
      //             projectRevision.projectQuarterlyReportFormChanges.edges.map(
      //               ({ node: { projectManagerLabel, formChange } }) => {
      //                 if (projectManagerLabel.id === labelId) {
      //                   return {
      //                     node: {
      //                       projectManagerLabel: projectManagerLabel,
      //                       formChange: {
      //                         id: "new",
      //                         newFormData,
      //                       },
      //                     },
      //                   };
      //                 }
      //                 return {
      //                   node: {
      //                     projectManagerLabel,
      //                     formChange,
      //                   },
      //                 };
      //               }
      //             ),
      //         },
      //       },
      //     },
      //   },
      // },
      onError: (error) => {
        console.log(error);
      },
    });
  };

  //   const [applyUpdateFormChangeMutation, isUpdating] =
  //     useUpdateQuarterlyReportFormChange();

  //   const [discardFormChange] = useDiscardFormChange(
  //     projectQuarterlyReportsFormChanges.__id
  //   );

  ////////onclick functions - add, delete, update, stage

  const handleAddRequirement = () => {
    addQuarterlyReport({});
  };
  return (
    <div>
      <header>
        <h2>Quarterly Reports</h2>

        {/* <SavingIndicator isSaved={!isUpdating && !isAdding} /> */}
      </header>

      <Grid cols={10} align="center">
        <Grid.Row>Quarterly reports status here</Grid.Row>
        <Grid.Row>
          <Grid.Col span={10}>
            <FormBorder>
              <Grid.Row className="addButtonContainer">
                <Button variant="secondary" onClick={handleAddRequirement}>
                  <FontAwesomeIcon icon={faPlusCircle} /> Add another quarterly
                  report
                </Button>
              </Grid.Row>
              {projectRevision.projectQuarterlyReportFormChanges.edges.map(
                ({ node }, index) => {
                  console.log("node is", node);
                  return (
                    <Grid.Row key={node.id} className="reportContainer">
                      <Grid.Col span={6}>
                        <h3>Quarterly Report {index + 1}</h3>
                        <FormBase
                          id={`form-${node.id}`}
                          idPrefix={`form-${node.id}`}
                          ref={(el) => (formRefs.current[node.id] = el)}
                          formData={node.newFormData}
                          onChange={(change) => {
                            console.log("change is", change);
                            //   updateFormChange(
                            //     { ...form, changeStatus: "pending" },
                            //     change.formData
                            //   );
                          }}
                          schema={quarterlyReportSchema as JSONSchema7}
                          uiSchema={quarterlyReportUiSchema}
                          ObjectFieldTemplate={EmptyObjectFieldTemplate}
                        />
                      </Grid.Col>
                      <Grid.Col span={4}>
                        <Button
                          variant="secondary"
                          size="small"
                          // onClick={() => deleteContact(form.id, form.operation)}
                        >
                          Remove
                        </Button>
                      </Grid.Col>
                    </Grid.Row>
                  );
                }
              )}
              {/* <Grid.Row>
                  <Grid.Col span={10}>
                    <Button
                      style={{ marginRight: "auto" }}
                      onClick={() =>
                        // allForms is already sorted by contactIndex
                        addContact(
                          allForms[allForms.length - 1].newFormData.contactIndex +
                            1
                        )
                      }
                    >
                      Add
                    </Button>
                  </Grid.Col>
                </Grid.Row> */}

              <Grid.Row>
                <Button
                  size="medium"
                  variant="primary"
                  // onClick={stageContactFormChanges}
                  //   disabled={isUpdating}
                >
                  Submit Quarterly Reports
                </Button>
              </Grid.Row>
            </FormBorder>
          </Grid.Col>
        </Grid.Row>
      </Grid>
      <style jsx>{`
        div :global(button.pg-button) {
          margin-left: 0.4em;
          margin-right: 0em;
        }
        div :global(.right-aligned-column) {
          display: flex;
          justify-content: flex-end;
          align-items: flex-start;
        }
        div :global(.reportContainer) {
          border-top: 1px solid black;
          padding-top: 1em;
        }
        div :global(.addButtonContainer) {
          margin-bottom: 1em;
        }
      `}</style>
    </div>
  );
};

export default ProjectQuarterlyReportsForm;
