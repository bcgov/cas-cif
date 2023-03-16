import { Button } from "@button-inc/bcgov-theme";
import FormBase from "components/Form/FormBase";
import { JSONSchema7 } from "json-schema";
import { FormPageFactoryComponentProps } from "lib/pages/relayFormPageFactory";
import { graphql, useFragment } from "react-relay";
import { OperatorForm_query$key } from "__generated__/OperatorForm_query.graphql";

interface Props extends FormPageFactoryComponentProps {
  query: OperatorForm_query$key;
}

const OperatorForm: React.FC<Props> = (props) => {
  const { operatorFormBySlug } = useFragment(
    graphql`
      fragment OperatorForm_query on Query {
        operatorFormBySlug: formBySlug(slug: "operator") {
          jsonSchema
        }
      }
    `,
    props.query
  );
  return (
    <FormBase
      {...props}
      schema={operatorFormBySlug.jsonSchema as JSONSchema7}
      uiSchema={{}}
    >
      <Button type="submit" style={{ marginRight: "1rem" }}>
        Submit
      </Button>
      <Button type="button" variant="secondary" onClick={props.onDiscard}>
        Discard Changes
      </Button>
    </FormBase>
  );
};

export default OperatorForm;
