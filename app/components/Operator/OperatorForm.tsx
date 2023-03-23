import FormBase from "components/Form/FormBase";
import { Button } from "@button-inc/bcgov-theme";
import FormComponentProps from "components/Form/Interfaces/FormComponentProps";
import { OperatorForm_formChange$key } from "__generated__/OperatorForm_formChange.graphql";
import { graphql, useFragment } from "react-relay/hooks";

interface Props extends FormComponentProps {
  formChange: OperatorForm_formChange$key;
}

const OperatorForm: React.FC<Props> = (props) => {
  const formChange = useFragment(
    graphql`
      fragment OperatorForm_formChange on FormChange {
        id
        newFormData
      }
    `,
    props.formChange
  );
  const { newFormData } = formChange;
  console.log("newFormData id", newFormData.id);

  return (
    <FormBase
      {...props}
      id="operator-form"
      formData={newFormData}
      schema={props.schema}
    >
      <Button type="submit" style={{ marginRight: "1rem" }}>
        Submit
      </Button>
      <Button type="button" variant="secondary">
        Discard Changes
      </Button>
    </FormBase>
  );
};

export default OperatorForm;
