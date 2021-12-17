import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { createProjectQuery } from "__generated__/createProjectQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import { mutation } from "mutations/FormChange/updateFormChange";
import { useRouter } from "next/router";
import { Button } from "@button-inc/bcgov-theme";
import Grid from "@button-inc/bcgov-theme/Grid";
import { useMemo, useState } from "react";
import useDebouncedMutation from "mutations/useDebouncedMutation";
import SavingIndicator from "components/Form/SavingIndicator";
import ProjecManagerForm from "components/Form/ProjectManagerForm";
import ProjectForm from "components/Form/ProjectForm";
import { mutation as updateProjectRevisionMutation } from "mutations/ProjectRevision/updateProjectRevision";
import { useMutation } from "react-relay";

const CreateProjectQuery = graphql`
  query createProjectQuery($id: ID!) {
    query {
      session {
        ...DefaultLayout_session
      }
      projectRevision(id: $id) {
        id
        updatedAt
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
  const [updateProjectRevision, updatingProjectRevision] = useMutation(
    updateProjectRevisionMutation
  );

  const lastEditedDate = useMemo(
    () => new Date(query.projectRevision.updatedAt),
    [query.projectRevision.updatedAt]
  );
  if (!query.projectRevision.id) return null;

  const handleChange = (queriedFormChange: any, changeObject: any) => {
    const updatedFormData = {
      ...queriedFormChange.newFormData,
      ...changeObject,
    };
    return updateFormChange({
      variables: {
        input: {
          id: queriedFormChange.id,
          formChangePatch: {
            newFormData: updatedFormData,
          },
        },
      },
      optimisticResponse: {
        updateFormChange: {
          formChange: {
            id: queriedFormChange.id,
            newFormData: updatedFormData,
          },
        },
      },
      debounceKey: queriedFormChange.id,
    });
  };

  if (!query.projectRevision.id) return null;

  const onFormErrors = (formId: string, incomingErrors: Array<any>) => {
    setErrors({ ...errors, [formId]: incomingErrors });
  };

  // Function: approve staged change, triggering an insert on the project table & redirect to the project page
  const commitProject = async () => {
    updateProjectRevision({
      variables: {
        input: {
          id: query.projectRevision.id,
          projectRevisionPatch: { changeStatus: "committed" },
        },
      },
      // No need for an optimistic response
      // Since we navigate away from the page after the mutation is complete
      onCompleted: async () => {
        await router.push({
          pathname: "/cif/projects",
        });
      },
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
          isSaved={!updatingFormChange && !updatingProjectRevision}
          lastEdited={lastEditedDate}
        />
      </header>
      <Grid cols={2}>
        <Grid.Row>
          <Grid.Col>
            <ProjectForm
              query={query}
              formData={query.projectRevision.projectFormChange.newFormData}
              onChange={(change) =>
                handleChange(query.projectRevision.projectFormChange, change)
              }
              onFormErrors={(error) =>
                onFormErrors(query.projectRevision.projectFormChange.id, error)
              }
            />
            <ProjecManagerForm
              formData={
                query.projectRevision.projectManagerFormChange.newFormData
              }
              onChange={(change) =>
                handleChange(
                  query.projectRevision.projectManagerFormChange,
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
          id="commit-project-button"
          size="medium"
          variant="primary"
          onClick={commitProject}
          disabled={Object.keys(errors).some(
            (key) => errors[key] && errors[key].length > 0
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
