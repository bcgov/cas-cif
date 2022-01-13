import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { ProjectRevisionQuery } from "__generated__/ProjectRevisionQuery.graphql";
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
import { mutation as discardProjectRevisionMutation } from "mutations/ProjectRevision/discardProjectRevision";
import { useMutation } from "react-relay";
import { getProjectsPageRoute } from "pageRoutes";
import useDiscardMutation from "mutations/useDiscardMutation";

const pageQuery = graphql`
  query ProjectRevisionQuery($projectRevision: ID!) {
    query {
      session {
        ...DefaultLayout_session
      }
      projectRevision(id: $projectRevision) {
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

export function ProjectRevision({
  preloadedQuery,
}: RelayProps<{}, ProjectRevisionQuery>) {
  const router = useRouter();
  const { query } = usePreloadedQuery(pageQuery, preloadedQuery);

  const [errors, setErrors] = useState({});

  const [updateFormChange, updatingFormChange] = useDebouncedMutation(mutation);
  const [updateProjectRevision, updatingProjectRevision] = useMutation(
    updateProjectRevisionMutation
  );
  const [discardProjectRevision, discardingProjectRevision] =
    useDiscardMutation("projectRevision", discardProjectRevisionMutation);

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
        await router.push(getProjectsPageRoute());
      },
    });
  };

  const discardRevision = async () => {
    await discardProjectRevision(query.projectRevision.id, {
      onCompleted: async () => {
        await router.push(getProjectsPageRoute());
      },
      onError: async (e) => {
        console.error("Error discarding the project", e);
      },
    });
  };

  return (
    <DefaultLayout session={query.session} title="CIF Projects Management">
      <header>
        <h2>Project Overview</h2>
        <SavingIndicator
          isSaved={
            !updatingFormChange &&
            !updatingProjectRevision &&
            !discardingProjectRevision
          }
          lastEdited={lastEditedDate}
        />
      </header>
      <Grid cols={2}>
        <Grid.Row gutter={[20, 0]}>
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
          </Grid.Col>
          <Grid.Col>
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
        <Grid.Row>
          <Button
            size="medium"
            variant="primary"
            onClick={commitProject}
            disabled={Object.keys(errors).some(
              (key) => errors[key] && errors[key].length > 0
            )}
          >
            Submit
          </Button>
          <Button size="medium" variant="secondary" onClick={discardRevision}>
            Discard Changes
          </Button>
          <Button size="medium" variant="secondary">
            Return to Project List
          </Button>
        </Grid.Row>
      </Grid>
      <style jsx>{`
        header {
          display: flex;
          justify-content: space-between;
          align-items: start;
        }

        :global(.pg-button) {
          margin-right: 3em;
        }
      `}</style>
    </DefaultLayout>
  );
}

export default withRelay(ProjectRevision, pageQuery, withRelayOptions);
