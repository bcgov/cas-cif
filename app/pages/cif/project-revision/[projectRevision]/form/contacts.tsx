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
          projectRevisionsByProjectId(
            first: 1
            filter: { changeStatus: { equalTo: "pending" } }
            orderBy: UPDATED_AT_DESC
          ) {
            nodes {
              id
              changeStatus
            }
          }
        }
        ...ProjectContactForm_projectRevision
        ...ProjectContactFormSummary_projectRevision
        ...TaskList_projectRevision
      }
      ...ProjectContactForm_query
      ...ProjectContactFormSummary_query
    }
  }
`;

export function ProjectContactsPage({
  preloadedQuery,
}: RelayProps<{}, contactsFormQuery>) {
  const { query } = usePreloadedQuery(pageQuery, preloadedQuery);
  const router = useRouter();
  const mode = !query.projectRevision.projectId
    ? "create"
    : query.projectRevision.changeStatus === "committed"
    ? "view"
    : "edit";

  const [createProjectRevision, isCreatingProjectRevision] =
    useCreateProjectRevision();

  const isRedirecting = useRedirectTo404IfFalsy(query.projectRevision);
  if (isRedirecting) return null;

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
        query.projectRevision.projectByProjectId.projectRevisionsByProjectId
          .nodes[0].id
      )
    );
  };

  const createEditButton = () => {
    const existingRevision =
      query.projectRevision.projectByProjectId.projectRevisionsByProjectId
        .nodes[0];
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

  const taskList = <TaskList projectRevision={query.projectRevision} />;

  const handleSubmit = () => {
    router.push(getProjectRevisionPageRoute(query.projectRevision.id));
  };
  return (
    <DefaultLayout session={query.session} leftSideNav={taskList}>
      {mode === "view" ? (
        <>
          {createEditButton()}
          <ProjectContactFormSummary
            query={query}
            projectRevision={query.projectRevision}
          />
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
