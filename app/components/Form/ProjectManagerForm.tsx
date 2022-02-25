import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import React, { useRef, useMemo } from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import { ProjectManagerForm_query$key } from "__generated__/ProjectManagerForm_query.graphql";
import FormBase from "./FormBase";
import projectManagerSchema from "data/jsonSchemaForm/projectManagerSchema";
import { ValidatingFormProps } from "./Interfaces/FormValidationTypes";
import Grid from "@button-inc/bcgov-theme/Grid";
import FormBorder from "lib/theme/components/FormBorder";
import { Button } from "@button-inc/bcgov-theme";
import validateFormWithErrors from "lib/helpers/validateFormWithErrors";
import useAddManagerToRevisionMutation from "mutations/Manager/addManagerToRevision";
import { mutation as deleteFormChangeMutation } from "mutations/FormChange/deleteFormChange";
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
          projectId
          managerFormChanges: projectManagerFormChangesByLabel {
            edges {
              cursor
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

  console.log(projectRevision.managerFormChanges)

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
        connections: [projectRevision.managerFormChanges.__id],
        projectRevisionId: projectRevision.rowId, newFormData: data,
      }
    });
  };

  // Delete a manager from the project revision
  const [discardFormChange] = useMutation(deleteFormChangeMutation);
  const deleteManager = (id: string) => {
    console.log(id)
    // discardFormChange({
    //   variables: {
    //     input: {
    //       id: formChange.node.id,
    //     },
    //     connections: [projectRevision.managerFormChanges.__id],
    //   },
    //   onCompleted: () => {
    //     // delete formRefs.current[formChangeId];
    //     console.log('deleted')
    //   },
    // });
  };

  const [applyUpdateFormChangeMutation] = useDebouncedMutation(
    updateFormChangeMutation
  );
  // Update and existing project_manager form change if it exists, otherwise create one
  const createOrUpdateFormChange = (formChangeId: string, labelId: number, change: any) => {
    console.log(formChangeId, change);
    const data = {...change, projectManagerLabelId: labelId, projectId: projectRevision.projectFormChange.formDataRecordId};
    console.log(data)

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
            newFormData: change,
          },
        },
      },
      debounceKey: formChangeId,
    });
  } else if (change.cifUserId) {
      console.log('CREATE: ', data);
      addManager(data);
    }
    else if (formChangeId && !change.cifUserId) {
      console.log('DELETE: ', change)
      // deleteManager(formChange.id)
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
                <>
                 <Grid.Row>
                 <label>{node.projectManagerLabel.label}</label>
                </Grid.Row>
                <Grid.Row key={node.projectManagerLabel.id}>
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
                </>
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
