import { Button } from "@button-inc/bcgov-theme";
import FormBase from "components/Form/FormBase";
import SelectRfpWidget from "components/Form/SelectRfpWidget";
import projectSchema from "data/jsonSchemaForm/projectSchema";
import { JSONSchema7, JSONSchema7TypeName } from "json-schema";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import { useCreateProjectMutation } from "mutations/Project/createProject";
import { useRouter } from "next/router";
import { useState } from "react";
import { graphql, useFragment } from "react-relay";
import {
  getExternalProjectRevisionFormPageRoute,
  getProjectRevisionFormPageRoute,
} from "routes/pageRoutes";

interface Props {
  query: any;
  isInternal: boolean;
}

const schema: JSONSchema7 = {
  $schema: projectSchema.$schema,
  type: projectSchema.type as JSONSchema7TypeName,
  required: ["fundingStreamRfpId"],
  properties: {
    fundingStreamRfpId: {
      type: "number",
      default: undefined,
    },
  },
};

const uiSchema = {
  fundingStreamRfpId: {
    "ui:widget": "SelectRfpWidget",
    "ui:options": {
      label: false,
    },
  },
};

const ProjectRfpForm: React.FC<Props> = (props) => {
  const query = useFragment(
    graphql`
      fragment ProjectRfpForm_query on Query {
        ...SelectRfpWidget_query
      }
    `,
    props.query
  );

  const router = useRouter();
  const [formState, setFormState] = useState({});
  const [createProject, isCreatingProject] = useCreateProjectMutation();
  const handleSubmit = (formData) => {
    createProject({
      variables: {
        input: {
          fundingStreamRpfId: formData.fundingStreamRfpId,
        },
      },
      onCompleted: (response) =>
        router.push(
          props.isInternal
            ? getProjectRevisionFormPageRoute(
                response.createProject.projectRevision.id,
                0,
                undefined,
                true,
                true
              )
            : getExternalProjectRevisionFormPageRoute(
                response.createProject.projectRevision.id,
                0,
                true
              )
        ),
    });
  };

  return (
    <>
      <header>
        <h2>New Project</h2>
      </header>
      <FormBase
        schema={schema}
        uiSchema={uiSchema}
        ObjectFieldTemplate={EmptyObjectFieldTemplate}
        formContext={{
          query,
          isInternal: props.isInternal,
        }}
        id="ProjectRfpFormForm"
        onSubmit={(e) => handleSubmit(e.formData)}
        onChange={({ formData }) => {
          setFormState(formData);
        }}
        formData={formState}
        widgets={{
          SelectRfpWidget: SelectRfpWidget,
        }}
      >
        <Button type="submit" size="small" disabled={isCreatingProject}>
          Confirm
        </Button>
        <em> These fields are immutable once selected</em>
      </FormBase>
      <style jsx>{`
        div :global(.definition-container) {
          flex-direction: column;
          gap: 0.5rem;
        }
        div :global(.revision-record-history-section) {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        div :global(.revision-record-history-section > dd) {
          margin-bottom: 0;
        }
        div :global(.revision-record-history-section > dd > em) {
          font-weight: bold;
          font-size: 0.9em;
        }
      `}</style>
    </>
  );
};
export default ProjectRfpForm;
