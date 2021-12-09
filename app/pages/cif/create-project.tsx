import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { createProjectQuery } from "__generated__/createProjectQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import updateFormChangeMutation, {
  mutation,
} from "mutations/FormChange/updateFormChange";
import updateProjectRevisionMutation from "mutations/ProjectRevision/updateProjectRevision";
import { useRouter } from "next/router";
import { Button } from "@button-inc/bcgov-theme";
import Grid from "@button-inc/bcgov-theme/Grid";
import { useMemo, useState } from "react";
import useDebouncedMutation from "mutations/useDebouncedMutation";
import SavingIndicator from "components/Form/SavingIndicator";

const CreateProjectQuery = graphql`
  query createProjectQuery($id: ID!) {
    query {
      session {
        ...DefaultLayout_session
      }
      projectRevision(id: $id) {
        id
        projectManagerFormChange {
          id
          newFormData
        }
        projectFormChange {
          id
          newFormData
        }
      }
      ...ProjectForm_query
      ...ProjectManagerForm_allUsers
    }
  }
`;

export function CreateProject({
  preloadedQuery,
}: RelayProps<{}, createProjectQuery>) {
  const router = useRouter();
  const { query } = usePreloadedQuery(CreateProjectQuery, preloadedQuery);

  const [errors, setErrors] = useState({});
  const [updateFormChange, updatingFormChange] = useDebouncedMutation(mutation);
  const lastEditedDate = useMemo(
    () => new Date(query.formChange.updatedAt),
    [query.formChange.updatedAt]
  );
  if (!query.formChange.id) return null;

  const formChangeData = query.formChange.newFormData;

  // A function to be called by individual components making changes to the overall form_change data
  const handleChange = (changeObject: any) => {
    const updatedFormData = { ...formChangeData, ...changeObject };
    return updateFormChange({
      variables: {
        input: {
          id: query.formChange.id,
          formChangePatch: {
            newFormData: updatedFormData,
          },
        },
      },
      optimisticResponse: {
        updateFormChange: {
          formChange: {
            id: query.formChange.id,
            newFormData: updatedFormData,
          },
        },
      },
      debounceKey: query.formChange.id,
    });
  };

  if (!query.projectRevision.id) return null;

  // Function: stage the change data in the form_change table - for an individual form
  const storeResult = async (formId, data) => {
    const variables = {
      input: {
        id: formId,
        formChangePatch: {
          newFormData: data,
        },
      },
    };
    await updateFormChangeMutation(preloadedQuery.environment, variables);
  };

  // A function to be called by individual components making changes to the overall form_change data
  const applyChangesFromComponent = (formId: string, changeObject: any) => {
    storeResult(formId, changeObject);
  };

  const onFormErrors = (formId: string, incomingErrors: Array<any>) => {
    setErrors({ ...errors, [formId]: incomingErrors });
  };

  const hasErrors = (formChangeIds: Array<string>, errorsObject: {}) => {
    return formChangeIds.some(
      (id) => errorsObject[id] && errorsObject[id].length > 0
    );
  };

  // Function: approve staged change, triggering an insert on the project table & redirect to the project page
  const commitProject = async () => {
    await updateProjectRevisionMutation(preloadedQuery.environment, {
      input: {
        id: query.projectRevision.id,
        projectRevisionPatch: { changeStatus: "committed" },
      },
    });
    await router.push({
      pathname: "/cif/projects",
    });
  };

  return (
    <DefaultLayout
      session={query.session}
      title="CIF Projects Management"
      width="wide"
    >
      <header>
        <h2>Project Overview</h2>
        <SavingIndicator
          isSaved={!updatingFormChange}
          lastEdited={lastEditedDate}
        />
      </header>
      <Grid cols={2}>
        <Grid.Row>
          <Grid.Col>
            <ProjectForm
              formData={query.formChange.newFormData}
              onChange={handleChange}
              onFormErrors={onFormErrors}
              query={query}
            />
            <ProjecManagerForm
              formData={
                query.projectRevision.projectManagerFormChange.newFormData
              }
              onChange={(change) =>
                applyChangesFromComponent(
                  query.projectRevision.projectManagerFormChange.id,
                  change
                )
              }
              onFormErrors={(e) =>
                onFormErrors(
                  query.projectRevision.projectManagerFormChange.id,
                  e
                )
              }
              allUsers={query}
            />
          </Grid.Col>
        </Grid.Row>
        <Button
          size="medium"
          variant="primary"
          onClick={commitProject}
          disabled={hasErrors(
            [query.projectRevision.projectManagerFormChange.id],
            errors
          )}
        >
          Commit Project Changes
        </Button>
      </Grid>
      <style jsx>{`
        header {
          display: flex;
          justify-content: space-between;
          align-items: start;
        }
      `}</style>
    </DefaultLayout>
  );
}

export default withRelay(CreateProject, CreateProjectQuery, withRelayOptions);
