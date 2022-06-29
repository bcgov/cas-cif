import ContactForm from "components/Contact/ContactForm";
import withRelayOptions from "lib/relay/withRelayOptions";
import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay } from "relay-nextjs";
import { graphql } from "relay-runtime";
import { usePreloadedQuery } from "react-relay";
import { FormContactFormQuery } from "__generated__/FormContactFormQuery.graphql";
import { RelayProps } from "relay-nextjs";

const pageQuery = graphql`
  query FormContactFormQuery($form: ID!) {
    session {
      ...DefaultLayout_session
    }
    formChange(id: $form) {
      ...ContactForm_formChange
    }
  }
`;

export function ContactFormPage({
  preloadedQuery,
}: RelayProps<{}, FormContactFormQuery>) {
  const { session, formChange } = usePreloadedQuery(pageQuery, preloadedQuery);

  return (
    <DefaultLayout session={session}>
      <ContactForm formChange={formChange} />
    </DefaultLayout>
  );
}

export default withRelay(ContactFormPage, pageQuery, withRelayOptions);
