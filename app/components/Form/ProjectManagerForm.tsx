import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import React, { useRef, useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectManagerForm_query$key } from "__generated__/ProjectManagerForm_query.graphql";
import FormBase from "./FormBase";
import projectManagerSchema from "data/jsonSchemaForm/projectManagerSchema";
import { ValidatingFormProps } from "./Interfaces/FormValidationTypes";
import Grid from "@button-inc/bcgov-theme/Grid";
import FormBorder from "lib/theme/components/FormBorder";
import { Button } from "@button-inc/bcgov-theme";
import validateFormWithErrors from "lib/helpers/validateFormWithErrors";
import useAddManagerToRevisionMutation from "mutations/Manager/addManagerToRevision";
import useDeleteManagerFromRevisionMutation from "mutations/Manager/deleteManagerFromRevision";
import { mutation as updateFormChangeMutation } from "mutations/FormChange/updateFormChange";
import useDebouncedMutation from "mutations/useDebouncedMutation";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";


interface Props extends ValidatingFormProps {
  query: ProjectManagerForm_query$key;
}

const uiSchema = {
  cifUserId: {
    "ui:placeholder": "Select a Project Manager",
    "ui:col-md": 12,
    "bcgov:size": "small",
    "ui:widget": "SearchWidget",
    "ui:options": {
      label: false,
    },
  }
};

const ProjectManagerForm: React.FC<Props> = (props) => {
  const formRefs = useRef({});
  const { allCifUsers, projectRevision } = useFragment(
    graphql`
      fragment ProjectManagerForm_query on Query {
        projectRevision(id: $projectRevision) {
          id
          rowId
          managerFormChanges: projectManagerFormChangesByLabel {
            edges {
              node {
                projectManagerLabel {
                  id
                  rowId
                  label
                }
                formChange {
                  id
                  newFormData
                }
              }
            }
          }
          projectFormChange {
            formDataRecordId
          }
        }
        allCifUsers {
          edges {
            node {
              rowId
              firstName
              lastName
            }
          }
        }
      }
    `,
    props.query
  );

  // Dynamically build the schema from the list of cif_users
  const managerSchema = useMemo(() => {
    const schema = projectManagerSchema;
    schema.properties.cifUserId = {
      ...schema.properties.cifUserId,
      anyOf: allCifUsers.edges.map(({ node }) => {
        return {
          type: "number",
          title: `${node.firstName} ${node.lastName}`,
          enum: [node.rowId],
          value: node.rowId,
        } as JSONSchema7Definition;
      }),
    };

    return schema as JSONSchema7;
  }, [allCifUsers]);

  // Add a manager to the project revision
  const [applyAddManagerToRevision] =
  useAddManagerToRevisionMutation();
  const addManager = (data: any) => {
    applyAddManagerToRevision({
      variables: {
        projectRevision: projectRevision.id,
        projectRevisionId: projectRevision.rowId,
        newFormData: data,
      }
    });
  };

  // Delete a manager from the project revision
  const [discardFormChange] = useDeleteManagerFromRevisionMutation();
  const deleteManager = (id: string) => {
    discardFormChange({
      variables: {
        input: {
          id: id,
        },
        projectRevision: projectRevision.id
      }
    });
  };

  const [applyUpdateFormChangeMutation] = useDebouncedMutation(
    updateFormChangeMutation
  );
  // Update an existing project_manager form change if it exists, otherwise create one
  const createOrUpdateFormChange = (formChangeId: string, labelId: number, change: any) => {
    const data = {...change, projectManagerLabelId: labelId, projectId: projectRevision.projectFormChange.formDataRecordId};

    // If a form_change already exists, and the payload contains a cifUserId update it
    if (formChangeId && change.cifUserId) {
    applyUpdateFormChangeMutation({
      variables: {
        input: {
          id: formChangeId,
          formChangePatch: {
            newFormData: data,
          },
        },
      },
      optimisticResponse: {
        updateFormChange: {
          formChange: {
            id: formChangeId,
            newFormData: data,
          },
        },
      },
      debounceKey: formChangeId,
    });
    // If a form_change does not exist, and the payload contains a cifUserId create a form_change record
  } else if (change.cifUserId) {
      addManager(data);
    }
    // If a form_change exists, and the payload does not contain a cifUserId delete it
    else if (formChangeId && !change.cifUserId) {
      deleteManager(formChangeId);
    }
  };

  props.setValidatingForm({
    selfValidate: () => {
      return Object.keys(formRefs.current).reduce((agg, formId) => {
        const formObject = formRefs.current[formId];
        return [...agg, ...validateFormWithErrors(formObject)];
      }, []);
    },
  });

  return (
    <>
      <Grid cols={10} align="center">
        <Grid.Row>
          <Grid.Col span={10}>
            <FormBorder title="Project Managers">
              {projectRevision.managerFormChanges.edges.map(({node}) => (
                <React.Fragment key={node.projectManagerLabel.id}>
                 <Grid.Row>
                 <label>{node.projectManagerLabel.label}</label>
                </Grid.Row>
                <Grid.Row >
                  <Grid.Col span={6}>
                    <FormBase
                      id={`form-manager-${node.projectManagerLabel.label}`}
                      idPrefix={`form-${node.projectManagerLabel.id}`}
                      ref={(el) => (formRefs.current[node.projectManagerLabel.id] = el)}
                      formData={node.formChange?.newFormData}
                      onChange={(change) => {
                        createOrUpdateFormChange(node.formChange?.id, node.projectManagerLabel.rowId, change.formData);
                      }}
                      schema={managerSchema}
                      uiSchema={uiSchema}
                      ObjectFieldTemplate={EmptyObjectFieldTemplate}
                    />
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => deleteManager(node.formChange?.id)}
                    >
                      Clear
                    </Button>
                  </Grid.Col>
                </Grid.Row>
                </React.Fragment>
              ))}
            </FormBorder>
          </Grid.Col>
        </Grid.Row>
      </Grid>
      <style jsx>{`
        :global(button.pg-button) {
          margin-left: 0.4em;
          margin-right: 0em;
        }
        :global(.right-aligned-column) {
          display: flex;
          justify-content: flex-end;
          align-items: flex-start;
        }
      `}</style>
    </>
  );
};

export default ProjectManagerForm;
