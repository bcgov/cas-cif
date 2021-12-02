import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { createProjectQuery } from "__generated__/createProjectQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import updateFormChangeMutation from "mutations/FormChange/updateFormChange";
import { useRouter } from "next/router";
import ProjectBackgroundForm from "components/Project/ProjectBackgroundForm";
import { Button } from "@button-inc/bcgov-theme";

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

export function CreateProject({
  preloadedQuery,
}: RelayProps<{}, createProjectQuery>) {
  const router = useRouter();
  const { query } = usePreloadedQuery(CreateProjectQuery, preloadedQuery);
  if (!query.formChange.id) return null;

  // Function: stage the change data in the form_change table
  const storeResult = async (data) => {
    const variables = {
      input: {
        id: query.formChange.id,
        formChangePatch: {
          newFormData: data,
        },
      },
    };
    await updateFormChangeMutation(preloadedQuery.environment, variables);
  };

  // The applyChangeFromComponent function will require this page to be aware of the state of the newFormData object
  const formChangeData = query.formChange.newFormData;

  // A function to be called by individual components making changes to the overall form_change data
  const applyChangeFromComponent = (changeObject: any) => {
    const updatedFormData = { ...formChangeData, ...changeObject };
    storeResult(updatedFormData);
  };

  // Function: approve staged change, triggering an insert on the project table & redirect to the project page
  const commitProject = async () => {
    await updateFormChangeMutation(preloadedQuery.environment, {
      input: {
        id: query.formChange.id,
        formChangePatch: { changeStatus: "committed" },
      },
    });
    await router.push({
      pathname: "/cif/projects",
    });
  };

  return (
    <DefaultLayout session={query.session} title="CIF Projects Management">
      <h1>Create Project</h1>
      <ProjectBackgroundForm
        formData={query.formChange.newFormData}
        applyChangeFromComponent={applyChangeFromComponent}
      />
      <Button>Save draft</Button>
      <Button size="medium" variant="primary" onClick={commitProject}>
        Commit Project Changes
      </Button>
    </DefaultLayout>
  );
}

export default withRelay(CreateProject, CreateProjectQuery, withRelayOptions);
