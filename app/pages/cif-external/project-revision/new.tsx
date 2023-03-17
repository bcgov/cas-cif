import ProjectRfpForm from "components/Form/ProjectRfpForm";
import ExternalLayout from "components/Layout/ExternalLayout";
import withRelayOptions from "lib/relay/withRelayOptions";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { RelayProps, withRelay } from "relay-nextjs";
import { newProjectRevisionExternalQuery } from "__generated__/newProjectRevisionExternalQuery.graphql";

export const pageQuery = graphql`
  query newProjectRevisionExternalQuery {
    query {
      session {
        ...ExternalLayout_session
      }
      ...ProjectRfpForm_query
    }
  }
`;

export function ExternalProjectRevisionNew({
  preloadedQuery,
}: RelayProps<{}, newProjectRevisionExternalQuery>) {
  const { query } = usePreloadedQuery(pageQuery, preloadedQuery);

  return (
    <ExternalLayout session={query.session}>
      <ProjectRfpForm query={query} isInternal={false} />
    </ExternalLayout>
  );
}
export default withRelay(
  ExternalProjectRevisionNew,
  pageQuery,
  withRelayOptions
);
