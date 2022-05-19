import { Button } from "@button-inc/bcgov-theme";
import DefaultLayout from "components/Layout/DefaultLayout";
import TaskList from "components/TaskList";
import formPages from "data/formPages";
import useRedirectTo404IfFalsy from "hooks/useRedirectTo404IfFalsy";
import useRedirectToLatestRevision from "hooks/useRedirectToLatestRevision";
import withRelayOptions from "lib/relay/withRelayOptions";
import { useCreateProjectRevision } from "mutations/ProjectRevision/createProjectRevision";
import { useRouter } from "next/router";
import {
  getProjectRevisionFormPageRoute,
  getProjectRevisionPageRoute,
} from "pageRoutes";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { RelayProps, withRelay } from "relay-nextjs";
import { FormIndexPageQuery } from "__generated__/FormIndexPageQuery.graphql";

const pageQuery = graphql`
  query FormIndexPageQuery($projectRevision: ID!) {
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
        ...TaskList_projectRevision
        ...ProjectForm_projectRevision
        ...ProjectFormSummary_projectRevision
        ...ProjectContactForm_projectRevision
        ...ProjectContactFormSummary_projectRevision
        ...ProjectManagerFormGroup_revision
        ...ProjectManagerFormSummary_projectRevision
      }
      ...ProjectForm_query
      ...ProjectContactForm_query
      ...ProjectManagerFormGroup_query
    }
  }
`;

export function ProjectOverviewForm({
  preloadedQuery,
}: RelayProps<{}, FormIndexPageQuery>) {
  const { query } = usePreloadedQuery(pageQuery, preloadedQuery);
  const router = useRouter();

  const mode =
    query.projectRevision?.changeStatus === "committed" ? "view" : "update";

  const existingRevision =
    query.projectRevision?.projectByProjectId?.pendingProjectRevision;

  const [createProjectRevision, isCreatingProjectRevision] =
    useCreateProjectRevision();

  const isRedirecting = useRedirectTo404IfFalsy(query.projectRevision);
  const isRedirectingToLatestRevision = useRedirectToLatestRevision(
    query.projectRevision?.id,
    query.projectRevision?.projectByProjectId?.latestCommittedProjectRevision
      ?.id,
    mode === "view"
  );
  // TODO: check that router.query.formIndex is within bounds
  if (isRedirecting || isRedirectingToLatestRevision) return null;

  const handleCreateRevision = () => {
    createProjectRevision({
      variables: { projectId: query.projectRevision.projectId },
      onCompleted: (response) => {
        router.push(
          getProjectRevisionFormPageRoute(
            response.createProjectRevision.projectRevision.id,
            router.query.formIndex as string
          )
        );
      },
    });
  };
  const handleResumeRevision = () => {
    router.push(
      getProjectRevisionFormPageRoute(
        query.projectRevision.projectByProjectId.pendingProjectRevision.id,
        router.query.formIndex as string
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

  const taskList = <TaskList projectRevision={query.projectRevision} />;

  const handleSubmit = () => {
    if (mode === "update") {
      // TODO: or if this is the last form
      router.push(getProjectRevisionPageRoute(query.projectRevision.id));
    } else {
      router.push(
        getProjectRevisionFormPageRoute(
          query.projectRevision.id,
          Number(router.query.formIndex) + 1
        )
      );
    }
  };

  const EditComponent = formPages[Number(router.query.formIndex)].editComponent;
  const ViewComponent = formPages[Number(router.query.formIndex)].viewComponent;
  return (
    <DefaultLayout session={query.session} leftSideNav={taskList}>
      {query.projectRevision.changeStatus === "committed" ? (
        <>
          {createEditButton()}
          <ViewComponent
            projectRevision={query.projectRevision}
            viewOnly={true}
          />
        </>
      ) : (
        <EditComponent
          query={query}
          projectRevision={query.projectRevision}
          onSubmit={handleSubmit}
        />
      )}
    </DefaultLayout>
  );
}

export default withRelay(ProjectOverviewForm, pageQuery, withRelayOptions);
