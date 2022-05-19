import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import withRelayOptions from "lib/relay/withRelayOptions";
import { useRouter } from "next/router";
import { getProjectRevisionPageRoute } from "pageRoutes";
import TaskList from "components/TaskList";
import useRedirectTo404IfFalsy from "hooks/useRedirectTo404IfFalsy";

import ProjectAnnualReportForm from "components/Form/ProjectAnnualReportForm";
import { annualReportsFormQuery } from "__generated__/annualReportsFormQuery.graphql";

const pageQuery = graphql`
  query annualReportsFormQuery($projectRevision: ID!) {
    query {
      session {
        ...DefaultLayout_session
      }
      projectRevision(id: $projectRevision) {
        id
        ...ProjectAnnualReportForm_projectRevision
        ...TaskList_projectRevision
      }
    }
  }
`;

export function ProjectAnnualReportsPage({
  preloadedQuery,
}: RelayProps<{}, annualReportsFormQuery>) {
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
      <ProjectAnnualReportForm
        projectRevision={query.projectRevision}
        onSubmit={handleSubmit}
      />
    </DefaultLayout>
  );
}

export default withRelay(ProjectAnnualReportsPage, pageQuery, withRelayOptions);
