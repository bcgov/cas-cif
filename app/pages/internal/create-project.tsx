import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { createProjectQuery } from "__generated__/createProjectQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import Form from "lib/theme/service-development-toolkit-form";
import { JSONSchema7 } from "json-schema";
import updateFormChangeMutation from "mutations/FormChange/updateFormChange";
import {useRouter} from "next/router";

export const CreateProjectQuery = graphql`
  query createProjectQuery($id: ID!) {
    query {
      session {
        ...DefaultLayout_session
      }
      formChange(id: $id) {
        id
        newFormData
      }
    }
  }
`;

const schema: JSONSchema7 = {
  type: "object",
  required: ["cif_identifier", "description"],
  properties: {
    cif_identifier: { type: "number", title: "CIF Identifier" },
    description: { type: "string", title: "Description" },
  },
};

const uiSchema = {
  cif_identifier: {
    "ui:placeholder": "1234",
    "ui:col-md": 4,
  },
  description: {
    "ui:placeholder": "describe the project...",
    "ui:col-md": 12,
  },
};

export function CreateProject({ preloadedQuery }: RelayProps<{}, createProjectQuery>) {
  const router = useRouter();
  const { query } = usePreloadedQuery(CreateProjectQuery, preloadedQuery);
  if (!query.formChange.id) return null;

  // Function: stage the change data in the form_change table
  const storeResult = async (result) => {
    const variables = {
      input: {
        id: query.formChange.id,
        formChangePatch: {
          newFormData: result,
        },
      },
    };
    await updateFormChangeMutation(preloadedQuery.environment, variables);
  };

  const onValueChanged = async (change) => {
    const { formData } = change;
    await storeResult(formData);
  };

  // Function: approve staged change, triggering an insert on the project table & redirect to the project page
  const saveProject = async () => {
    await updateFormChangeMutation(preloadedQuery.environment, {
      input: {
        id: query.formChange.id,
        formChangePatch: { changeStatus: "saved" },
      },
    });
    await router.push({
      pathname: "/internal/projects",
    });
  };

  const formData = {
    cif_identifier: query.formChange.newFormData.cif_identifier || "",
    description: query.formChange.newFormData.description || "",
  };

  return (
    <DefaultLayout session={query.session} title="CIF Projects Management">
      <h1>Create Project</h1>
      <Form
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        onSubmit={saveProject}
        onChange={onValueChanged}
      />
    </DefaultLayout>
  );
}

export default withRelay(CreateProject, CreateProjectQuery, withRelayOptions);
