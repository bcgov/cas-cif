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
import ProjectContactFormSummary from "components/Form/ProjectContactFormSummary";

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
    ? "add"
    : query.projectRevision.changeStatus === "committed"
    ? "view"
    : "edit";

  const isRedirecting = useRedirectTo404IfFalsy(query.projectRevision);
  if (isRedirecting) return null;

  const taskList = <TaskList projectRevision={query.projectRevision} />;

  const handleSubmit = () => {
    router.push(getProjectRevisionPageRoute(query.projectRevision.id));
  };
  console.log(mode);
  return (
    <DefaultLayout session={query.session} leftSideNav={taskList}>
      {mode === "view" ? (
        <ProjectContactFormSummary
          query={query}
          projectRevision={query.projectRevision}
        />
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
