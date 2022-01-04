import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { ProjectOverwiewQuery } from "__generated__/ProjectOverwiewQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";

const pageQuery = graphql`
  query ProjectOverwiewQuery($project: ID!) {
    session {
      ...DefaultLayout_session
    }
    project(id: $project) {
      projectName
    }
  }
`;

function ProjectOverview({
  preloadedQuery,
}: RelayProps<{}, ProjectOverwiewQuery>) {
  const { session, project } = usePreloadedQuery(pageQuery, preloadedQuery);
  return (
    <DefaultLayout session={session}>
      <h2>{project.projectName}</h2>
    </DefaultLayout>
  );
}

export default withRelay(ProjectOverview, pageQuery, withRelayOptions);
