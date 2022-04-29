import ProjectContactFormSummary from "components/Form/ProjectContactFormSummary";
import ProjectFormSummary from "components/Form/ProjectFormSummary";
import ProjectManagerFormSummary from "components/Form/ProjectManagerFormSummary";
import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { ProjectRevisionQuery } from "__generated__/ProjectRevisionQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import { useRouter } from "next/router";
import { Button, Textarea } from "@button-inc/bcgov-theme";
import { mutation as updateProjectRevisionMutation } from "mutations/ProjectRevision/updateProjectRevision";
import { useUpdateChangeReason } from "mutations/ProjectRevision/updateChangeReason";
import { useDeleteProjectRevisionMutation } from "mutations/ProjectRevision/deleteProjectRevision";
import SavingIndicator from "components/Form/SavingIndicator";

import { getProjectsPageRoute } from "pageRoutes";
import useRedirectTo404IfFalsy from "hooks/useRedirectTo404IfFalsy";
import TaskList from "components/TaskList";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";

const pageQuery = graphql`
  query ProjectRevisionQuery($projectRevision: ID!) {
    query {
      session {
        ...DefaultLayout_session
      }
      projectRevision(id: $projectRevision) {
        id
        changeReason
        projectId
        ...ProjectFormSummary_projectRevision
        ...ProjectContactFormSummary_projectRevision
        ...ProjectManagerFormSummary_projectRevision
        ...TaskList_projectRevision
      }
    }
  }
`;

export function ProjectRevision({
  preloadedQuery,
}: RelayProps<{}, ProjectRevisionQuery>) {
  const router = useRouter();
  const { query } = usePreloadedQuery(pageQuery, preloadedQuery);

  const [updateChangeReason, updatingChangeReason] = useUpdateChangeReason();

  const [updateProjectRevision, updatingProjectRevision] =
    useMutationWithErrorMessage(
      updateProjectRevisionMutation,
      () => "An error occurred while attempting to update the project revision."
    );
  const [discardProjectRevision, discardingProjectRevision] =
    useDeleteProjectRevisionMutation();

  const isRedirecting = useRedirectTo404IfFalsy(query.projectRevision);
  if (isRedirecting) return null;

  /**
   *  Function: approve staged change, trigger an insert on the project
   *  table & redirect to the project page
   */
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
      updater: (store) => {
        // Invalidate the entire store,to make sure that we don't display any stale data after redirecting to the next page.
        // This could be optimized to only invalidate the affected records.
        store.invalidateStore();
      },
    });
  };

  const handleChange = (e) => {
    return new Promise((resolve, reject) =>
      updateChangeReason({
        variables: {
          input: {
            id: query.projectRevision.id,
            projectRevisionPatch: { changeReason: e.target.value },
          },
        },
        optimisticResponse: {
          updateProjectRevision: {
            projectRevision: {
              id: query.projectRevision.id,
              changeReason: e.target.value,
            },
          },
        },
        onCompleted: resolve,
        onError: reject,
        debounceKey: query.projectRevision.id,
      })
    );
  };

  const discardRevision = async () => {
    await discardProjectRevision({
      variables: {
        input: {
          id: query.projectRevision.id,
        },
      },
      onCompleted: async () => {
        await router.push(getProjectsPageRoute());
      },
      onError: async (e) => {
        console.error("Error discarding the project", e);
      },
    });
  };

  const taskList = <TaskList projectRevision={query.projectRevision} />;

  return (
    <DefaultLayout session={query.session} leftSideNav={taskList}>
      <div>
        <header>
          <h2>Review and Submit Project</h2>
        </header>
        <ProjectFormSummary projectRevision={query.projectRevision} />
        <ProjectManagerFormSummary projectRevision={query.projectRevision} />
        <ProjectContactFormSummary projectRevision={query.projectRevision} />

        {query.projectRevision.projectId && (
          <div>
            <h4>Please describe the reason for these changes</h4>
            <SavingIndicator isSaved={!updatingChangeReason} />
            <Textarea
              value={query.projectRevision.changeReason}
              onChange={handleChange}
              size={"medium"}
              resize="vertical"
            />
          </div>
        )}

        <Button
          size="medium"
          variant="primary"
          onClick={commitProject}
          disabled={
            updatingProjectRevision ||
            discardingProjectRevision ||
            updatingChangeReason ||
            (query.projectRevision.projectId &&
              !query.projectRevision.changeReason)
          }
        >
          Submit
        </Button>
        <Button
          size="medium"
          variant="secondary"
          onClick={discardRevision}
          disabled={updatingProjectRevision || discardingProjectRevision}
        >
          Discard Changes
        </Button>
      </div>
      <style jsx>{`
        div :global(.pg-button) {
          margin-right: 3em;
        }
        :global(textarea) {
          width: 100%;
          min-height: 10rem;
        }
      `}</style>
    </DefaultLayout>
  );
}

export default withRelay(ProjectRevision, pageQuery, withRelayOptions);
