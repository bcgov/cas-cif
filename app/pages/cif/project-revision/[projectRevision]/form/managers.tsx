import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { managersFormQuery } from "__generated__/managersFormQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import ProjectManagerFormGroup from "components/Form/ProjectManagerFormGroup";
import TaskList from "components/TaskList";
import { getProjectRevisionPageRoute } from "pageRoutes";
import useRedirectTo404IfFalsy from "hooks/useRedirectTo404IfFalsy";
import { useRouter } from "next/router";

const pageQuery = graphql`
  query managersFormQuery($projectRevision: ID!) {
    query {
      session {
        ...DefaultLayout_session
      }
      projectRevision(id: $projectRevision) {
        id
        ...ProjectManagerFormGroup_revision
        ...TaskList_projectRevision
      }
      ...ProjectManagerFormGroup_query
    }
  }
`;

export function ProjectRevision({
  preloadedQuery,
}: RelayProps<{}, managersFormQuery>) {
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
      <ProjectManagerFormGroup
        query={query}
        revision={query.projectRevision}
        onSubmit={handleSubmit}
      />
    </DefaultLayout>
  );
}

export default withRelay(ProjectRevision, pageQuery, withRelayOptions);
