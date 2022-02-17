import { Button } from "@button-inc/bcgov-theme";
import FormBase from "components/Form/FormBase";
import operatorSchema from "data/jsonSchemaForm/operatorSchema";
import { JSONSchema7 } from "json-schema";
import { FormPageFactoryComponentProps } from "lib/pages/relayFormPageFactory";

const OperatorForm: React.FC<FormPageFactoryComponentProps> = (props) => {
  return (
    <FormBase {...props} schema={operatorSchema as JSONSchema7} uiSchema={{}}>
      <Button type="submit">Submit</Button>
      <Button type="button" onClick={props.onDiscard}>
        Discard Changes
      </Button>
    </FormBase>
  );
};

export default OperatorForm;
