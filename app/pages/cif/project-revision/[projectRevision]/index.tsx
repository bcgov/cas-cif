import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { ProjectRevisionQuery } from "__generated__/ProjectRevisionQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import { useRouter } from "next/router";
import { Button } from "@button-inc/bcgov-theme";
import { mutation as updateProjectRevisionMutation } from "mutations/ProjectRevision/updateProjectRevision";
import { useDeleteProjectRevisionMutation } from "mutations/ProjectRevision/deleteProjectRevision";
import { useMutation } from "react-relay";
import { getProjectsPageRoute } from "pageRoutes";
import useRedirectTo404IfFalsy from "hooks/useRedirectTo404IfFalsy";
import TaskList from "components/TaskList";

const pageQuery = graphql`
  query ProjectRevisionQuery($projectRevision: ID!) {
    query {
      session {
        ...DefaultLayout_session
      }
      projectRevision(id: $projectRevision) {
        id
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

  const [updateProjectRevision, updatingProjectRevision] = useMutation(
    updateProjectRevisionMutation
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

        <Button
          size="medium"
          variant="primary"
          onClick={commitProject}
          disabled={updatingProjectRevision || discardingProjectRevision}
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
      `}</style>
    </DefaultLayout>
  );
}

export default withRelay(ProjectRevision, pageQuery, withRelayOptions);
