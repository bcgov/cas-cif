import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { contactsFormQuery } from "__generated__/contactsFormQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import { useRouter } from "next/router";
import { getProjectRevisionPageRoute } from "pageRoutes";
//brianna - to create
// import ProjectQuarterlyReportsForm from "components/Form/ProjectQuarterlyReportsForm";
import TaskList from "components/TaskList";
import useRedirectTo404IfFalsy from "hooks/useRedirectTo404IfFalsy";
import { quarterlyReportsFormQuery } from "__generated__/quarterlyReportsFormQuery.graphql";

//brianna - no computed column for changes to quarterly reports (vs overview, managers, and contacts), make one? Either way, fix query
const pageQuery = graphql`
  query quarterlyReportsFormQuery($projectRevision: ID!) {
    query {
      session {
        ...DefaultLayout_session
      }
      projectRevision(id: $projectRevision) {
        id
        projectByProjectId {
          reportingRequirementsByProjectId {
            edges {
              node {
                comments
                completionDate
              }
            }
          }
        }
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
  //brianna - from contacts page
  const handleSubmit = () => {
    router.push(getProjectRevisionPageRoute(query.projectRevision.id));
  };

  return (
    <DefaultLayout session={query.session} leftSideNav={taskList}>
      <p>This is the quarterly reports page!</p>
    </DefaultLayout>
  );
}

export default withRelay(
  ProjectQuarterlyReportsPage,
  pageQuery,
  withRelayOptions
);
