import ProjectRfpForm from "components/Form/ProjectRfpForm";
import DefaultLayout from "components/Layout/DefaultLayout";
import withRelayOptions from "lib/relay/withRelayOptions";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { RelayProps, withRelay } from "relay-nextjs";
import { newProjectRevisionQuery } from "__generated__/newProjectRevisionQuery.graphql";

export const pageQuery = graphql`
  query newProjectRevisionQuery {
    query {
      session {
        ...DefaultLayout_session
      }
      ...ProjectRfpForm_query
    }
  }
`;

export function ProjectRevisionNew({
  preloadedQuery,
}: RelayProps<{}, newProjectRevisionQuery>) {
  const { query } = usePreloadedQuery(pageQuery, preloadedQuery);

  return (
    <DefaultLayout session={query.session}>
      <ProjectRfpForm query={query} isInternal />
    </DefaultLayout>
  );
}
export default withRelay(ProjectRevisionNew, pageQuery, withRelayOptions);
