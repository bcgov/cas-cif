import OperatorForm from "components/Operator/OperatorForm";
import relayFormPageFactory from "lib/pages/relayFormPageFactory";
import withRelayOptions from "lib/relay/withRelayOptions";
import { getOperatorsPageRoute } from "pageRoutes";
import { withRelay } from "relay-nextjs";

const [FormPage, query] = relayFormPageFactory(
  "Operator",
  getOperatorsPageRoute(),
  OperatorForm
);

export default withRelay(FormPage, query, withRelayOptions);
