import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { operatorsQuery } from "__generated__/operatorsQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";

const pageQuery = graphql`
  query operatorsQuery {
    session {
      ...DefaultLayout_session
    }
  }
`;

function Operators({ preloadedQuery }: RelayProps<{}, operatorsQuery>) {
  const { session } = usePreloadedQuery(pageQuery, preloadedQuery);
  return <DefaultLayout session={session}></DefaultLayout>;
}

export default withRelay(Operators, pageQuery, withRelayOptions);
