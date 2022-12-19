import { Button } from "@button-inc/bcgov-theme";
import FormBase from "components/Form/FormBase";
import SelectRfpWidget from "components/Form/SelectRfpWidget";
import DefaultLayout from "components/Layout/DefaultLayout";
import projectSchema from "data/jsonSchemaForm/projectSchema";
import { JSONSchema7, JSONSchema7TypeName } from "json-schema";
import withRelayOptions from "lib/relay/withRelayOptions";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import { useCreateProjectMutation } from "mutations/Project/createProject";
import { useRouter } from "next/router";
import { useState } from "react";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { RelayProps, withRelay } from "relay-nextjs";
import { getProjectRevisionFormPageRoute } from "routes/pageRoutes";
import { newProjectRevisionQuery } from "__generated__/newProjectRevisionQuery.graphql";

const schema: JSONSchema7 = {
  $schema: projectSchema.$schema,
  type: projectSchema.type as JSONSchema7TypeName,
  required: ["fundingStreamRfpId"],
  properties: {
    fundingStreamRfpId: {
      type: "number",
      title: "RFP Year ID",
    },
  },
};

const uiSchema = {
  fundingStreamRfpId: {
    "ui:widget": "SelectRfpWidget",
    "ui:options": {
      text: `text`,
      label: true,
    },
  },
};

export const pageQuery = graphql`
  query newProjectRevisionQuery {
    query {
      session {
        ...DefaultLayout_session
      }
      ...SelectRfpWidget_query
    }
  }
`;

export function ProjectRevisionNew({
  preloadedQuery,
}: RelayProps<{}, newProjectRevisionQuery>) {
  const { query } = usePreloadedQuery(pageQuery, preloadedQuery);

  const router = useRouter();
  const [formState, setFormState] = useState({});
  const [createProject, isCreatingProject] = useCreateProjectMutation();

  const handleSubmit = (formData) => {
    console.log("formData", formData);
    createProject({
      variables: {
        input: {
          fundingStreamRpfId: formData.fundingStreamRfpId,
        },
      },
      onCompleted: (response) =>
        router.push(
          getProjectRevisionFormPageRoute(
            response.createProject.projectRevision.id,
            0
          )
        ),
    });
  };

  return (
    <>
      <DefaultLayout session={query.session}>
        <header>
          <h2>New Project</h2>
        </header>
        <FormBase
          schema={schema}
          uiSchema={uiSchema}
          ObjectFieldTemplate={EmptyObjectFieldTemplate}
          formContext={{
            query,
          }}
          id="ProjectRevisionNewForm"
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
      </DefaultLayout>
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
}
export default withRelay(ProjectRevisionNew, pageQuery, withRelayOptions);
