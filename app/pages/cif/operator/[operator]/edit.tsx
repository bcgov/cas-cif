import withRelayOptions from "lib/relay/withRelayOptions";
import { graphql } from "react-relay";
import { RelayProps, withRelay } from "relay-nextjs";
import { usePreloadedQuery } from "react-relay/hooks";
import { editOperatorQuery } from "__generated__/editOperatorQuery.graphql";
import DefaultLayout from "components/Layout/DefaultLayout";

const operatorQuery = graphql`
  query editOperatorQuery($operator: ID!) {
    session {
      ...DefaultLayout_session
    }
    operator(id: $operator) {
      legalName
    }
  }
`;

export function EditOperator({
  preloadedQuery,
}: RelayProps<{}, editOperatorQuery>) {
  const { session, operator } = usePreloadedQuery(
    operatorQuery,
    preloadedQuery
  );

  return <DefaultLayout session={session}>{operator.legalName}</DefaultLayout>;
}

export default withRelay(EditOperator, operatorQuery, withRelayOptions);
