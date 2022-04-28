import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { managersFormQuery } from "__generated__/managersFormQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import ProjectManagerFormGroup from "components/Form/ProjectManagerFormGroup";
import ProjectManagerFormSummary from "components/Form/ProjectManagerFormSummary";
import TaskList from "components/TaskList";
import {
  getProjectRevisionPageRoute,
  getProjectRevisionManagersFormPageRoute,
} from "pageRoutes";
import { useCreateProjectRevision } from "mutations/ProjectRevision/createProjectRevision";
import useRedirectTo404IfFalsy from "hooks/useRedirectTo404IfFalsy";
import { useRouter } from "next/router";
import { Button } from "@button-inc/bcgov-theme";

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
        }
        ...ProjectManagerFormGroup_revision
        ...ProjectManagerFormSummary_projectRevision
        ...TaskList_projectRevision
      }
      ...ProjectManagerFormGroup_query
      ...ProjectManagerFormSummary_query
    }
  }
`;

export function ProjectManagersForm({
  preloadedQuery,
}: RelayProps<{}, managersFormQuery>) {
  const { query } = usePreloadedQuery(pageQuery, preloadedQuery);
  const router = useRouter();

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
    const existingRevision =
      query.projectRevision.projectByProjectId.pendingProjectRevision;
    return (
      <>
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
          :global(.edit-button) {
            float: right;
          }
        `}</style>
      </>
    );
  };

  const isRedirecting = useRedirectTo404IfFalsy(query.projectRevision);
  if (isRedirecting) return null;

  const taskList = <TaskList projectRevision={query.projectRevision} />;

  const handleSubmit = () => {
    router.push(getProjectRevisionPageRoute(query.projectRevision.id));
  };

  return (
    <DefaultLayout session={query.session} leftSideNav={taskList}>
      {query.projectRevision.changeStatus === "committed" ? (
        <>
          {createEditButton()}
          <ProjectManagerFormSummary
            query={query}
            projectRevision={query.projectRevision}
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
