import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { revisionsQuery } from "__generated__/revisionsQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import useRedirectTo404IfFalsy from "hooks/useRedirectTo404IfFalsy";

const pageQuery = graphql`
  query revisionsQuery($project: ID!) {
    session {
      ...DefaultLayout_session
    }
    project(id: $project) {
      projectName
    }
  }
`;

function ProjectRevisions({ preloadedQuery }: RelayProps<{}, revisionsQuery>) {
  const { session, project } = usePreloadedQuery(pageQuery, preloadedQuery);

  const isRedirecting = useRedirectTo404IfFalsy(project);
  if (isRedirecting) return null;
  return (
    <DefaultLayout session={session}>
      <h2>{project.projectName}</h2>
    </DefaultLayout>
  );
}

export default withRelay(ProjectRevisions, pageQuery, withRelayOptions);
