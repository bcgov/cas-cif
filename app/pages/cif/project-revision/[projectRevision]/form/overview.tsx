import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { overviewFormQuery } from "__generated__/overviewFormQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import ProjectForm from "components/Form/ProjectForm";
import TaskList from "components/TaskList";
import useRedirectTo404IfFalsy from "hooks/useRedirectTo404IfFalsy";
import { useRouter } from "next/router";
import { getProjectRevisionPageRoute } from "pageRoutes";
import ProjectFormSummary from "components/Form/ProjectFormSummary";

const pageQuery = graphql`
  query overviewFormQuery($projectRevision: ID!) {
    query {
      session {
        ...DefaultLayout_session
      }
      projectRevision(id: $projectRevision) {
        id
        changeStatus
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

  const isRedirecting = useRedirectTo404IfFalsy(query.projectRevision);
  if (isRedirecting) return null;

  const taskList = <TaskList projectRevision={query.projectRevision} />;

  const handleSubmit = () => {
    router.push(getProjectRevisionPageRoute(query.projectRevision.id));
  };

  return (
    <DefaultLayout session={query.session} leftSideNav={taskList}>
      {query.projectRevision.changeStatus === "committed" ? (
        <ProjectFormSummary
          query={query}
          projectRevision={query.projectRevision}
        />
      ) : (
        <ProjectForm
          query={query}
          projectRevision={query.projectRevision}
          onSubmit={handleSubmit}
          disabled={query.projectRevision.changeStatus === "committed"}
        />
      )}
    </DefaultLayout>
  );
}

export default withRelay(ProjectOverviewForm, pageQuery, withRelayOptions);
