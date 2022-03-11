import ContactForm from "components/Contact/ContactForm";
import relayFormPageFactory from "lib/pages/relayFormPageFactory";
import withRelayOptions from "lib/relay/withRelayOptions";
import { getContactsPageRoute } from "pageRoutes";
import { withRelay } from "relay-nextjs";

const [FormPage, query] = relayFormPageFactory(
  "Contact",
  getContactsPageRoute(),
  ContactForm
);

export default withRelay(FormPage, query, withRelayOptions);
