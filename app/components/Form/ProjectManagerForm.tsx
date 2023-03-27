import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import { useMemo, MutableRefObject } from "react";
import { graphql, useFragment } from "react-relay";
import {
  FormChangeOperation,
  ProjectManagerForm_managerFormChange$key,
} from "__generated__/ProjectManagerForm_managerFormChange.graphql";
import { ProjectManagerForm_query$key } from "__generated__/ProjectManagerForm_query.graphql";
import FormBase from "./FormBase";
import FormComponentProps from "./Interfaces/FormComponentProps";
import { Button } from "@button-inc/bcgov-theme";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import FieldLabel from "lib/theme/widgets/FieldLabel";

interface Props extends FormComponentProps {
  managerFormChange: ProjectManagerForm_managerFormChange$key;
  query: ProjectManagerForm_query$key;
  projectRowId: number;
  onUpdate: (formChangeId: string, rowId: number, newFormData: any) => void;
  onAdd: (newFormData: any) => void;
  onDelete: (
    formChangeId: string,
    formChangeRowId: number,
    operation: FormChangeOperation
  ) => void;
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
        text: contact ? `${contact}` : undefined,
      },
    },
  };
};

const ProjectManagerForm: React.FC<Props> = (props) => {
  const { query, projectRowId, formRefs, onAdd, onUpdate, onDelete, disabled } =
    props;

  const { allCifUsers, projectMangerFormBySlug } = useFragment(
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
        projectMangerFormBySlug: formBySlug(slug: "project_manager") {
          jsonSchema
        }
      }
    `,
    query
  );

  const { formChange, projectManagerLabel } = useFragment(
    graphql`
      fragment ProjectManagerForm_managerFormChange on ManagerFormChangesByLabelCompositeReturn {
        projectManagerLabel {
          id
          rowId
          label
        }
        formChange {
          rowId
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
    const parsedSchema = JSON.parse(
      JSON.stringify(projectMangerFormBySlug.jsonSchema.schema)
    );
    const schema = { ...parsedSchema };

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
  }, [allCifUsers, projectMangerFormBySlug]);

  const uiSchema = createProjectManagerUiSchema();

  // Update an existing project_manager form change if it exists, otherwise create one
  const createOrUpdateFormChange = (formData: { cifUserId: number }) => {
    const { rowId: labelRowId } = projectManagerLabel;
    const data = {
      ...formData,
      projectManagerLabelId: labelRowId,
      projectId: projectRowId,
    };

    // If a form_change already exists, and the payload contains a cifUserId update it
    if (formChange && formData?.cifUserId) {
      onUpdate(formChange.id, formChange.rowId, data);

      // If a form_change does not exist, and the payload contains a cifUserId create a form_change record
    } else if (formData?.cifUserId) {
      onAdd(data);
    }
  };
  const formIdPrefix = `form-${projectManagerLabel.id}`;

  const formData =
    formChange && formChange.operation !== "ARCHIVE"
      ? formChange.newFormData
      : undefined;

  return (
    <>
      <FieldLabel
        label={projectManagerLabel.label}
        required={false}
        htmlFor={`${formIdPrefix}_cifUserId`}
      />
      <div>
        <FormBase
          id={`form-manager-${projectManagerLabel.label}`}
          validateOnMount={formChange?.changeStatus === "staged"}
          idPrefix={formIdPrefix}
          ref={(el) => el && (formRefs.current[projectManagerLabel.id] = el)}
          formData={formData}
          onChange={(data) => {
            createOrUpdateFormChange(data.formData);
          }}
          schema={managerSchema}
          uiSchema={uiSchema}
          ObjectFieldTemplate={EmptyObjectFieldTemplate}
        />
        <Button
          disabled={disabled || !formChange?.id}
          variant="secondary"
          size="small"
          onClick={() =>
            onDelete(formChange.id, formChange.rowId, formChange.operation)
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
