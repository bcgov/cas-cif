import OperatorForm from "components/Operator/OperatorForm";
import withRelayOptions from "lib/relay/withRelayOptions";
import { RelayProps, withRelay } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import DefaultLayout from "components/Layout/DefaultLayout";
import { FormOperatorFormQuery } from "__generated__/FormOperatorFormQuery.graphql";

const pageQuery = graphql`
  query FormOperatorFormQuery {
    session {
      ...DefaultLayout_session
    }
    formBySlug(slug: "operator") {
      jsonSchema
    }
  }
`;

export function OperatorFormPage({
  preloadedQuery,
}: RelayProps<{}, FormOperatorFormQuery>) {
  const { session, formBySlug } = usePreloadedQuery(pageQuery, preloadedQuery);
  return (
    <DefaultLayout session={session}>
      <OperatorForm jsonSchema={formBySlug.jsonSchema} />
    </DefaultLayout>
  );
}

export default withRelay(OperatorFormPage, pageQuery, withRelayOptions);
