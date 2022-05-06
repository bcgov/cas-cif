import { Button } from "@button-inc/bcgov-theme";
import Grid from "@button-inc/bcgov-theme/Grid";
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
import { useRef } from "react";
import { graphql, useFragment } from "react-relay";
import { FormChangeOperation } from "__generated__/ProjectContactForm_projectRevision.graphql";
import { ProjectQuarterlyReportsForm_projectRevision$key } from "__generated__/ProjectQuarterlyReportsForm_projectRevision.graphql";
import FormBase from "./FormBase";
import SavingIndicator from "./SavingIndicator";

interface Props {
  onSubmit: () => void;
  projectRevision: ProjectQuarterlyReportsForm_projectRevision$key;
}

const quarterlyReportUiSchema = {
  dueDate: {
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

  const [addQuarterlyReportMutation, isAdding] =
    useAddReportingRequirementToRevision();

  const addQuarterlyReport = () => {
    const formData = {
      status: "on_track",
      projectId: projectRevision.projectFormChange.formDataRecordId,
      reportType: "Quarterly",
    };

    addQuarterlyReportMutation({
      variables: {
        projectRevisionId: projectRevision.rowId,
        newFormData: formData,
        connections: [projectRevision.projectQuarterlyReportFormChanges.__id],
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

  return (
    <div>
      <header>
        <h2>Quarterly Reports</h2>

        <SavingIndicator isSaved={!isUpdating && !isAdding} />
      </header>

      <Grid cols={10} align="center">
        <Grid.Row>Quarterly reports status here</Grid.Row>
        <Grid.Row>
          <Grid.Col span={10}>
            <FormBorder>
              <Grid.Row className="addButtonContainer">
                <Button variant="secondary" onClick={addQuarterlyReport}>
                  <FontAwesomeIcon icon={faPlusCircle} /> Add another quarterly
                  report
                </Button>
              </Grid.Row>
              {projectRevision.projectQuarterlyReportFormChanges.edges.map(
                ({ node }, index) => {
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
                            updateFormChange(
                              { ...node, changeStatus: "pending" },
                              change.formData
                            );
                          }}
                          schema={
                            projectReportingRequirementSchema as JSONSchema7
                          }
                          uiSchema={quarterlyReportUiSchema}
                          ObjectFieldTemplate={EmptyObjectFieldTemplate}
                        />
                      </Grid.Col>
                      <Grid.Col span={4}>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() =>
                            deleteQuarterlyReport(node.id, node.operation)
                          }
                        >
                          Remove
                        </Button>
                      </Grid.Col>
                    </Grid.Row>
                  );
                }
              )}

              <Grid.Row>
                <Button
                  size="medium"
                  variant="primary"
                  onClick={stageQuarterlyReportFormChanges}
                  disabled={isUpdating}
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
