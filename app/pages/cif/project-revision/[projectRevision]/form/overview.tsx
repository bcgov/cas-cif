import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { overviewFormQuery } from "__generated__/overviewFormQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";

import ProjectForm from "components/Form/ProjectForm";

const pageQuery = graphql`
  query overviewFormQuery($projectRevision: ID!) {
    query {
      session {
        ...DefaultLayout_session
      }
      projectRevision(id: $projectRevision) {
        id
        ...ProjectForm_projectRevision
      }
      ...ProjectForm_query
    }
  }
`;

export function ProjectRevision({
  preloadedQuery,
}: RelayProps<{}, overviewFormQuery>) {
  const { query } = usePreloadedQuery(pageQuery, preloadedQuery);

  if (!query.projectRevision.id) return null;

  return (
    <DefaultLayout session={query.session} title="CIF Projects Management">
      <ProjectForm query={query} projectRevision={query.projectRevision} />
    </DefaultLayout>
  );
}

export default withRelay(ProjectRevision, pageQuery, withRelayOptions);
