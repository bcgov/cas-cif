import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { OperatorOverwiewQuery } from "__generated__/OperatorOverwiewQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";

const pageQuery = graphql`
  query OperatorOverwiewQuery($operator: ID!) {
    session {
      ...DefaultLayout_session
    }
    operator(id: $operator) {
      legalName
    }
  }
`;

function OperatorOverview({
  preloadedQuery,
}: RelayProps<{}, OperatorOverwiewQuery>) {
  const { session, operator } = usePreloadedQuery(pageQuery, preloadedQuery);
  return (
    <DefaultLayout session={session}>
      <h2>{operator.legalName}</h2>
    </DefaultLayout>
  );
}

export default withRelay(OperatorOverview, pageQuery, withRelayOptions);
