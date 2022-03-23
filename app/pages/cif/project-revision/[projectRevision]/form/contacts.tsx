import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { contactsFormQuery } from "__generated__/contactsFormQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import { useRouter } from "next/router";
import { getProjectRevisionPageRoute } from "pageRoutes";
import ProjectContactForm from "components/Form/ProjectContactForm";
import TaskList from "components/TaskList";
import useRedirectTo404IfFalsy from "hooks/useRedirectTo404IfFalsy";

const pageQuery = graphql`
  query contactsFormQuery($projectRevision: ID!) {
    query {
      session {
        ...DefaultLayout_session
      }
      projectRevision(id: $projectRevision) {
        id
        ...ProjectContactForm_projectRevision
        ...TaskList_projectRevision
      }
      ...ProjectContactForm_query
    }
  }
`;

export function ProjectRevision({
  preloadedQuery,
}: RelayProps<{}, contactsFormQuery>) {
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
      <ProjectContactForm
        query={query}
        projectRevision={query.projectRevision}
        onSubmit={handleSubmit}
      />
    </DefaultLayout>
  );
}

export default withRelay(ProjectRevision, pageQuery, withRelayOptions);
