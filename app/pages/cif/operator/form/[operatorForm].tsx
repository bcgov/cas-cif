import getRelayFormPage from "lib/pages/relayFormPageFactory";
import { getOperatorsPageRoute } from "pageRoutes";
import OperatorForm from "pages/cif/operator/form/[operatorForm]";

const operatorForm = getRelayFormPage(getOperatorsPageRoute(), OperatorForm);

export default operatorForm;
