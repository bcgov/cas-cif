import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import { useMemo, MutableRefObject } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectManagerForm_managerFormChange$key } from "__generated__/ProjectManagerForm_managerFormChange.graphql";
import { ProjectManagerForm_query$key } from "__generated__/ProjectManagerForm_query.graphql";
import FormBase from "./FormBase";
import projectManagerSchema from "data/jsonSchemaForm/projectManagerSchema";
import FormComponentProps from "./Interfaces/FormComponentProps";
import Grid from "@button-inc/bcgov-theme/Grid";
import { Button } from "@button-inc/bcgov-theme";
import useAddManagerToRevisionMutation from "mutations/Manager/addManagerToRevision";
import { useUpdateFormChange } from "mutations/FormChange/updateFormChange";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import FieldLabel from "lib/theme/widgets/FieldLabel";
import useDeleteManagerFromRevisionMutation from "mutations/Manager/deleteManagerFromRevision";

interface Props extends FormComponentProps {
  managerFormChange: ProjectManagerForm_managerFormChange$key;
  query: ProjectManagerForm_query$key;
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
    query,
    projectId,
    projectRevisionId,
    projectRevisionRowId,
    formRefs,
  } = props;

  const { allCifUsers } = useFragment(
    graphql`
      fragment ProjectManagerForm_query on Query {
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
    query
  );

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

  const [applyUpdateFormChangeMutation] = useUpdateFormChange();

  // Delete a manager from the project revision
  const [deleteManager, deleteManagerInFlight] =
    useDeleteManagerFromRevisionMutation(change.formChange?.operation);
  const handleClear = () => {
    let variables;
    let optimisticResponse;
    if (change.formChange?.operation === "CREATE")
      variables = {
        input: {
          id: change.formChange.id,
        },
        projectRevision: projectRevisionId,
      };
    else {
      variables = {
        input: {
          id: change.formChange.id,
          formChangePatch: {
            operation: "ARCHIVE",
          },
        },
        projectRevision: projectRevisionId,
      };
      optimisticResponse = {
        updateFormChange: {
          formChange: {
            id: change.formChange.id,
            operation: "ARCHIVE",
            newFormData: {},
          },
        },
      };
    }
    deleteManager({
      variables,
      optimisticResponse,
      onError: (error) => {
        console.log(error);
      },
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
    else if (formChangeId && !formChange.cifUserId && !deleteManagerInFlight) {
      handleClear();
    }
  };

  const formIdPrefix = `form-${change.projectManagerLabel.id}`;

  return (
    <>
      <Grid.Row>
        <FieldLabel
          label={change.projectManagerLabel.label}
          required={false}
          htmlFor={`${formIdPrefix}_cifUserId`}
          uiSchema={uiSchema}
        />
        <Grid.Col span={6}>
          <FormBase
            id={`form-manager-${change.projectManagerLabel.label}`}
            idPrefix={formIdPrefix}
            ref={(el) => (formRefs.current[change.projectManagerLabel.id] = el)}
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
            disabled={deleteManagerInFlight || !change.formChange?.id}
            variant="secondary"
            size="small"
            onClick={() => handleClear()}
          >
            Clear
          </Button>
        </Grid.Col>
      </Grid.Row>
    </>
  );
};

export default ProjectManagerForm;
