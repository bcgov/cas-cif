import OperatorForm from "components/Operator/OperatorForm";
import withRelayOptions from "lib/relay/withRelayOptions";
import { RelayProps, withRelay } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import DefaultLayout from "components/Layout/DefaultLayout";
import { FormOperatorFormQuery } from "__generated__/FormOperatorFormQuery.graphql";

const pageQuery = graphql`
  query FormOperatorFormQuery($form: ID!) {
    session {
      ...DefaultLayout_session
    }
    formChange(id: $form) {
      ...OperatorForm_formChange
    }
  }
`;

export function OperatorFormPage({
  preloadedQuery,
}: RelayProps<{}, FormOperatorFormQuery>) {
  const { session, formChange } = usePreloadedQuery(pageQuery, preloadedQuery);
  return (
    <DefaultLayout session={session}>
      <OperatorForm formChange={formChange} />
    </DefaultLayout>
  );
}

export default withRelay(OperatorFormPage, pageQuery, withRelayOptions);
