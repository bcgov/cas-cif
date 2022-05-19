import { Button } from "@button-inc/bcgov-theme";
import ProjectManagerFormGroup from "components/Form/ProjectManagerFormGroup";
import ProjectManagerFormSummary from "components/Form/ProjectManagerFormSummary";
import DefaultLayout from "components/Layout/DefaultLayout";
import TaskList from "components/TaskList";
import useRedirectTo404IfFalsy from "hooks/useRedirectTo404IfFalsy";
import useRedirectToLatestRevision from "hooks/useRedirectToLatestRevision";
import withRelayOptions from "lib/relay/withRelayOptions";
import { useCreateProjectRevision } from "mutations/ProjectRevision/createProjectRevision";
import { useRouter } from "next/router";
import {
  getProjectRevisionContactsFormPageRoute,
  getProjectRevisionManagersFormPageRoute,
  getProjectRevisionPageRoute,
} from "pageRoutes";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { RelayProps, withRelay } from "relay-nextjs";
import { managersFormQuery } from "__generated__/managersFormQuery.graphql";

const pageQuery = graphql`
  query managersFormQuery($projectRevision: ID!) {
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
        ...ProjectManagerFormGroup_revision
        ...ProjectManagerFormSummary_projectRevision
        ...TaskList_projectRevision
      }
      ...ProjectManagerFormGroup_query
    }
  }
`;

export function ProjectManagersForm({
  preloadedQuery,
}: RelayProps<{}, managersFormQuery>) {
  const { query } = usePreloadedQuery(pageQuery, preloadedQuery);
  const router = useRouter();
  const existingRevision =
    query.projectRevision?.projectByProjectId?.pendingProjectRevision;
  const [createProjectRevision, isCreatingProjectRevision] =
    useCreateProjectRevision();

  const handleCreateRevision = () => {
    createProjectRevision({
      variables: { projectId: query.projectRevision.projectId },
      onCompleted: (response) => {
        router.push(
          getProjectRevisionManagersFormPageRoute(
            response.createProjectRevision.projectRevision.id
          )
        );
      },
    });
  };

  const handleResumeRevision = () => {
    router.push(
      getProjectRevisionManagersFormPageRoute(
        query.projectRevision.projectByProjectId.pendingProjectRevision.id
      )
    );
  };

  const createEditButton = () => {
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

  const isRedirectingToLatestRevision = useRedirectToLatestRevision(
    query.projectRevision?.id,
    query.projectRevision?.projectByProjectId?.latestCommittedProjectRevision
      ?.id,
    query.projectRevision?.changeStatus === "committed"
  );
  const isRedirecting = useRedirectTo404IfFalsy(query.projectRevision);
  if (isRedirecting || isRedirectingToLatestRevision) return null;

  const taskList = <TaskList projectRevision={query.projectRevision} />;

  const handleSubmit = () => {
    if (existingRevision) {
      router.push(getProjectRevisionPageRoute(query.projectRevision.id));
    } else {
      router.push(
        getProjectRevisionContactsFormPageRoute(query.projectRevision.id)
      );
    }
  };

  return (
    <DefaultLayout session={query.session} leftSideNav={taskList}>
      {query.projectRevision.changeStatus === "committed" ? (
        <>
          {createEditButton()}
          <ProjectManagerFormSummary
            projectRevision={query.projectRevision}
            viewOnly={true}
          />
        </>
      ) : (
        <ProjectManagerFormGroup
          query={query}
          revision={query.projectRevision}
          onSubmit={handleSubmit}
        />
      )}
    </DefaultLayout>
  );
}

export default withRelay(ProjectManagersForm, pageQuery, withRelayOptions);
