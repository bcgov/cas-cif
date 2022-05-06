import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { contactsFormQuery } from "__generated__/contactsFormQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import { useRouter } from "next/router";
import {
  getProjectRevisionPageRoute,
  getProjectRevisionContactsFormPageRoute,
} from "pageRoutes";
import { useCreateProjectRevision } from "mutations/ProjectRevision/createProjectRevision";
import ProjectContactForm from "components/Form/ProjectContactForm";
import TaskList from "components/TaskList";
import useRedirectTo404IfFalsy from "hooks/useRedirectTo404IfFalsy";
import useRedirectToLatestRevision from "hooks/useRedirectToLatestRevision";
import ProjectContactFormSummary from "components/Form/ProjectContactFormSummary";
import { Button } from "@button-inc/bcgov-theme";

const pageQuery = graphql`
  query contactsFormQuery($projectRevision: ID!) {
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
        ...ProjectContactForm_projectRevision
        ...ProjectContactFormSummary_projectRevision
        ...TaskList_projectRevision
      }
      ...ProjectContactForm_query
    }
  }
`;

export function ProjectContactsPage({
  preloadedQuery,
}: RelayProps<{}, contactsFormQuery>) {
  const { query } = usePreloadedQuery(pageQuery, preloadedQuery);
  const router = useRouter();
  const mode = !query.projectRevision?.projectId
    ? "create"
    : query.projectRevision.changeStatus === "committed"
    ? "view"
    : "edit";

  const [createProjectRevision, isCreatingProjectRevision] =
    useCreateProjectRevision();

  const isRedirectingToLatestRevision = useRedirectToLatestRevision(
    query.projectRevision?.id,
    query.projectRevision?.projectByProjectId?.latestCommittedProjectRevision
      ?.id,
    mode === "view"
  );
  const isRedirecting = useRedirectTo404IfFalsy(query.projectRevision);
  if (isRedirecting || isRedirectingToLatestRevision) return null;

  const handleCreateRevision = () => {
    createProjectRevision({
      variables: { projectId: query.projectRevision.projectId },
      onCompleted: (response) => {
        router.push(
          getProjectRevisionContactsFormPageRoute(
            response.createProjectRevision.projectRevision.id
          )
        );
      },
    });
  };

  const handleResumeRevision = () => {
    router.push(
      getProjectRevisionContactsFormPageRoute(
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
      {mode === "view" ? (
        <>
          {createEditButton()}
          <ProjectContactFormSummary projectRevision={query.projectRevision} />
        </>
      ) : (
        <ProjectContactForm
          query={query}
          projectRevision={query.projectRevision}
          onSubmit={handleSubmit}
        />
      )}
    </DefaultLayout>
  );
}

export default withRelay(ProjectContactsPage, pageQuery, withRelayOptions);
