import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import { useMemo, MutableRefObject } from "react";
import { graphql, useFragment } from "react-relay";
import {
  FormChangeOperation,
  ProjectManagerForm_managerFormChange$key,
} from "__generated__/ProjectManagerForm_managerFormChange.graphql";
import { ProjectManagerForm_query$key } from "__generated__/ProjectManagerForm_query.graphql";
import FormBase from "./FormBase";
import projectManagerSchema from "data/jsonSchemaForm/projectManagerSchema";
import FormComponentProps from "./Interfaces/FormComponentProps";
import { Button } from "@button-inc/bcgov-theme";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import FieldLabel from "lib/theme/widgets/FieldLabel";

interface Props extends FormComponentProps {
  managerFormChange: ProjectManagerForm_managerFormChange$key;
  query: ProjectManagerForm_query$key;
  projectRowId: number;
  onUpdate: (formChangeId: string, newFormData: any) => void;
  onAdd: (newFormData: any) => void;
  onDelete: (formChangeId: string, operation: FormChangeOperation) => void;
  formRefs: MutableRefObject<{}>;
  disabled?: boolean;
}

// You only need to include the optional arguments when using this function to create the schema for the summary (read-only) page.
export const createProjectManagerUiSchema = (contact?, role?) => {
  return {
    cifUserId: {
      "ui:placeholder": "Select a Project Manager",
      "ui:col-md": 12,
      "bcgov:size": "small",
      "ui:widget": "SearchWidget",
      "ui:title": role,
      "ui:options": {
        label: role ? true : false,
        text: `${contact}`,
      },
    },
  };
};

export const createProjectManagerSchema = (allCifUsers) => {
  const schema = projectManagerSchema;
  schema.properties.cifUserId = {
    ...schema.properties.cifUserId,
    anyOf: allCifUsers.edges.map(({ node }) => {
      return {
        type: "number",
        title: node.fullName,
        enum: [node.rowId],
        value: node.rowId,
      } as JSONSchema7Definition;
    }),
  };

  return schema as JSONSchema7;
};

const ProjectManagerForm: React.FC<Props> = (props) => {
  const { query, projectRowId, formRefs, onAdd, onUpdate, onDelete, disabled } =
    props;

  const { allCifUsers } = useFragment(
    graphql`
      fragment ProjectManagerForm_query on Query {
        allCifUsers {
          edges {
            node {
              rowId
              fullName
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
          changeStatus
        }
      }
    `,
    props.managerFormChange
  );

  // Dynamically build the schema from the list of cif_users
  const managerSchema = useMemo(() => {
    return createProjectManagerSchema(allCifUsers);
  }, [allCifUsers]);

  const uiSchema = createProjectManagerUiSchema();

  // Update an existing project_manager form change if it exists, otherwise create one
  const createOrUpdateFormChange = (formData: { cifUserId: number }) => {
    const {
      formChange,
      projectManagerLabel: { rowId: labelRowId },
    } = change;
    const data = {
      ...formData,
      projectManagerLabelId: labelRowId,
      projectId: projectRowId,
    };

    // If a form_change already exists, and the payload contains a cifUserId update it
    if (formChange && formData?.cifUserId) {
      onUpdate(formChange.id, data);

      // If a form_change does not exist, and the payload contains a cifUserId create a form_change record
    } else if (formData?.cifUserId) {
      onAdd(data);
    }
  };
  const formIdPrefix = `form-${change.projectManagerLabel.id}`;

  return (
    <>
      <FieldLabel
        label={change.projectManagerLabel.label}
        required={false}
        htmlFor={`${formIdPrefix}_cifUserId`}
      />
      <div>
        <FormBase
          id={`form-manager-${change.projectManagerLabel.label}`}
          validateOnMount={change.formChange?.changeStatus === "staged"}
          idPrefix={formIdPrefix}
          ref={(el) => (formRefs.current[change.projectManagerLabel.id] = el)}
          formData={change.formChange?.newFormData}
          onChange={(data) => {
            createOrUpdateFormChange(data.formData);
          }}
          schema={managerSchema}
          uiSchema={uiSchema}
          ObjectFieldTemplate={EmptyObjectFieldTemplate}
        />
        <Button
          disabled={disabled || !change.formChange?.id}
          variant="secondary"
          size="small"
          onClick={() =>
            onDelete(change.formChange.id, change.formChange.operation)
          }
        >
          Clear
        </Button>
      </div>
      <style jsx>{`
        div {
          display: flex;
          align-items: flex-start;
        }
        div :global(form) {
          flex-grow: 1;
        }
      `}</style>
    </>
  );
};

export default ProjectManagerForm;
