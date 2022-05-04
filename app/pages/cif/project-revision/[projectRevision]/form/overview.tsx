import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { overviewFormQuery } from "__generated__/overviewFormQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import ProjectForm from "components/Form/ProjectForm";
import TaskList from "components/TaskList";
import useRedirectTo404IfFalsy from "hooks/useRedirectTo404IfFalsy";
import { useRouter } from "next/router";
import {
  getProjectRevisionPageRoute,
  getProjectRevisionOverviewFormPageRoute,
} from "pageRoutes";
import ProjectFormSummary from "components/Form/ProjectFormSummary";
import { useCreateProjectRevision } from "mutations/ProjectRevision/createProjectRevision";
import useRedirectToLatestRevision from "hooks/useRedirectToLatestRevision";
import { Button } from "@button-inc/bcgov-theme";

const pageQuery = graphql`
  query overviewFormQuery($projectRevision: ID!) {
    query {
      session {
        ...DefaultLayout_session
      }
      projectRevision(id: $projectRevision) {
        id
        changeStatus
        projectId
        projectByProjectId {
          pendingProjectRevision {
            id
          }
          latestCommittedProjectRevision {
            id
          }
        }
        ...ProjectForm_projectRevision
        ...TaskList_projectRevision
        ...ProjectFormSummary_projectRevision
      }
      ...ProjectForm_query
      ...ProjectFormSummary_query
    }
  }
`;

export function ProjectOverviewForm({
  preloadedQuery,
}: RelayProps<{}, overviewFormQuery>) {
  const { query } = usePreloadedQuery(pageQuery, preloadedQuery);
  const router = useRouter();

  const mode =
    query.projectRevision?.changeStatus === "committed" ? "view" : "update";

  const [createProjectRevision, isCreatingProjectRevision] =
    useCreateProjectRevision();

  const isRedirecting = useRedirectTo404IfFalsy(query.projectRevision);
  const isRedirectingToLatestRevision = useRedirectToLatestRevision(
    query.projectRevision?.id,
    query.projectRevision?.projectByProjectId?.latestCommittedProjectRevision
      ?.id,
    mode === "view"
  );
  if (isRedirecting || isRedirectingToLatestRevision) return null;

  const handleCreateRevision = () => {
    createProjectRevision({
      variables: { projectId: query.projectRevision.projectId },
      onCompleted: (response) => {
        router.push(
          getProjectRevisionOverviewFormPageRoute(
            response.createProjectRevision.projectRevision.id
          )
        );
      },
    });
  };
  const handleResumeRevision = () => {
    router.push(
      getProjectRevisionOverviewFormPageRoute(
        query.projectRevision.projectByProjectId.pendingProjectRevision.id
      )
    );
  };

  const createEditButton = () => {
    const existingRevision =
      query.projectRevision.projectByProjectId.pendingProjectRevision;
    return (
      <div>
        <Button
          className="edit-button"
          onClick={
            existingRevision ? handleResumeRevision : handleCreateRevision
          }
          disabled={isCreatingProjectRevision}
        >
          {existingRevision ? "Resume Edition" : "Edit"}
        </Button>
        <style jsx>{`
          div :global(.edit-button) {
            float: right;
          }
        `}</style>
      </div>
    );
  };

  const taskList = <TaskList projectRevision={query.projectRevision} />;

  const handleSubmit = () => {
    router.push(getProjectRevisionPageRoute(query.projectRevision.id));
  };

  return (
    <DefaultLayout session={query.session} leftSideNav={taskList}>
      {query.projectRevision.changeStatus === "committed" ? (
        <>
          {createEditButton()}
          <ProjectFormSummary
            query={query}
            projectRevision={query.projectRevision}
          />
        </>
      ) : (
        <ProjectForm
          query={query}
          projectRevision={query.projectRevision}
          onSubmit={handleSubmit}
        />
      )}
    </DefaultLayout>
  );
}

export default withRelay(ProjectOverviewForm, pageQuery, withRelayOptions);
