import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import React, { useMemo, MutableRefObject } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectManagerForm_managerFormChange$key } from "__generated__/ProjectManagerForm_managerFormChange.graphql";
import FormBase from "./FormBase";
import projectManagerSchema from "data/jsonSchemaForm/projectManagerSchema";
import FormComponentProps from "./Interfaces/FormComponentProps";
import Grid from "@button-inc/bcgov-theme/Grid";
import { Button } from "@button-inc/bcgov-theme";
import useAddManagerToRevisionMutation from "mutations/Manager/addManagerToRevision";
import useDeleteManagerFromRevisionMutation from "mutations/Manager/deleteManagerFromRevision";
import { mutation as updateFormChangeMutation } from "mutations/FormChange/updateFormChange";
import useDebouncedMutation from "mutations/useDebouncedMutation";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import FieldLabel from "lib/theme/widgets/FieldLabel";

interface Props extends FormComponentProps {
  managerFormChange: ProjectManagerForm_managerFormChange$key;
  allCifUsers: {
    edges: ReadonlyArray<{
      readonly node: {
        readonly rowId: number;
        readonly firstName: string | null;
        readonly lastName: string | null;
      };
    }>;
  };
  projectId: number;
  projectRevisionId: string;
  projectRevisionRowId: number;
  formRefs: MutableRefObject<{}>;
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
  },
};

const ProjectManagerForm: React.FC<Props> = (props) => {
  const {
    allCifUsers,
    projectId,
    projectRevisionId,
    projectRevisionRowId,
    formRefs,
  } = props;

  const change = useFragment(
    graphql`
      fragment ProjectManagerForm_managerFormChange on ManagerFormChangesByLabelCompositeReturn {
        projectManagerLabel {
          id
          rowId
          label
        }
        formChange {
          id
          operation
          newFormData
        }
      }
    `,
    props.managerFormChange
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
  const [applyAddManagerToRevision] = useAddManagerToRevisionMutation();
  const addManager = (data: {
    cifUserId: number;
    projectManagerLabelId: number;
    projectId: number;
  }) => {
    applyAddManagerToRevision({
      variables: {
        projectRevision: projectRevisionId,
        projectRevisionId: projectRevisionRowId,
        newFormData: data,
      },
      optimisticResponse: {
        createFormChange: {
          query: {
            projectRevision: {
              managerFormChanges: {
                edges: {
                  change: {
                    projectManagerLabel: {},
                    formChange: {
                      id: "new",
                      newFormData: data,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  };

  const [applyUpdateFormChangeMutation] = useDebouncedMutation(
    updateFormChangeMutation
  );

  // Delete a manager from the project revision
  const [discardFormChange, discardInFlight] =
    useDeleteManagerFromRevisionMutation();
  const deleteManager = (id: string) => {
    if (change.formChange.operation === "CREATE")
      discardFormChange({
        variables: {
          input: {
            id: id,
          },
          projectRevision: projectRevisionId,
        },
        onError: (error) => {
          console.log(error);
        },
      });
    else
      applyUpdateFormChangeMutation({
        variables: {
          input: {
            id: id,
            formChangePatch: {
              operation: "ARCHIVE",
            },
          },
        },
        optimisticResponse: {
          updateFormChange: {
            formChange: {
              id: id,
              newFormData: {},
            },
          },
        },
        onError: (error) => {
          console.log(error);
        },
        debounceKey: id,
      });
  };

  // Update an existing project_manager form change if it exists, otherwise create one
  const createOrUpdateFormChange = (
    formChangeId: string,
    labelId: number,
    formChange: { cifUserId: number }
  ) => {
    const data = {
      ...formChange,
      projectManagerLabelId: labelId,
      projectId: projectId,
    };

    // If a form_change already exists, and the payload contains a cifUserId update it
    if (formChangeId && formChange?.cifUserId) {
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
    } else if (formChange?.cifUserId) {
      addManager(data);
    }
    // If a form_change exists, and the payload does not contain a cifUserId delete it
    else if (formChangeId && !formChange.cifUserId && !discardInFlight) {
      deleteManager(formChangeId);
    }
  };

  return (
    <>
      <React.Fragment key={change.projectManagerLabel.id}>
        <Grid.Row>
          <FieldLabel
            label={change.projectManagerLabel.label}
            required={false}
            htmlFor={change.projectManagerLabel.id}
            uiSchema={uiSchema}
          />
        </Grid.Row>
        <Grid.Row>
          <Grid.Col span={6}>
            <FormBase
              id={`form-manager-${change.projectManagerLabel.label}`}
              idPrefix={`form-${change.projectManagerLabel.id}`}
              ref={(el) =>
                (formRefs.current[change.projectManagerLabel.id] = el)
              }
              formData={change.formChange?.newFormData}
              onChange={(data) => {
                createOrUpdateFormChange(
                  change.formChange?.id,
                  change.projectManagerLabel.rowId,
                  data.formData
                );
              }}
              schema={managerSchema}
              uiSchema={uiSchema}
              ObjectFieldTemplate={EmptyObjectFieldTemplate}
            />
          </Grid.Col>
          <Grid.Col span={4}>
            <Button
              disabled={discardInFlight || !change.formChange?.id}
              variant="secondary"
              size="small"
              onClick={() => deleteManager(change.formChange?.id)}
            >
              Clear
            </Button>
          </Grid.Col>
        </Grid.Row>
      </React.Fragment>
    </>
  );
};

export default ProjectManagerForm;
