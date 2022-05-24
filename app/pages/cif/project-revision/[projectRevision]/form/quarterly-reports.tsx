import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import withRelayOptions from "lib/relay/withRelayOptions";
import { useRouter } from "next/router";
import { getProjectRevisionAnnualReportsFormPageRoute } from "pageRoutes";
import TaskList from "components/TaskList";
import useRedirectTo404IfFalsy from "hooks/useRedirectTo404IfFalsy";

import ProjectQuarterlyReportForm from "components/Form/ProjectQuarterlyReportForm";
import { quarterlyReportsFormQuery } from "__generated__/quarterlyReportsFormQuery.graphql";

const pageQuery = graphql`
  query quarterlyReportsFormQuery($projectRevision: ID!) {
    query {
      session {
        ...DefaultLayout_session
      }
      projectRevision(id: $projectRevision) {
        id
        ...ProjectQuarterlyReportForm_projectRevision
        ...TaskList_projectRevision
      }
    }
  }
`;

export function ProjectQuarterlyReportsPage({
  preloadedQuery,
}: RelayProps<{}, quarterlyReportsFormQuery>) {
  const { query } = usePreloadedQuery(pageQuery, preloadedQuery);
  const router = useRouter();

  const isRedirecting = useRedirectTo404IfFalsy(query.projectRevision);
  if (isRedirecting) return null;

  const taskList = <TaskList projectRevision={query.projectRevision} />;

  const handleSubmit = () => {
    router.push(
      getProjectRevisionAnnualReportsFormPageRoute(query.projectRevision.id)
    );
  };

  return (
    <DefaultLayout session={query.session} leftSideNav={taskList}>
      <ProjectQuarterlyReportForm
        projectRevision={query.projectRevision}
        onSubmit={handleSubmit}
      />
    </DefaultLayout>
  );
}

export default withRelay(
  ProjectQuarterlyReportsPage,
  pageQuery,
  withRelayOptions
);
