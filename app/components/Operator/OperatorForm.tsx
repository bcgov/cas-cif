import { Button } from "@button-inc/bcgov-theme";
import FormBase from "components/Form/FormBase";
import FormComponentProps from "components/Form/Interfaces/FormComponentProps";
import { getOperatorsPageRoute } from "routes/pageRoutes";
import { graphql, useFragment } from "react-relay/hooks";
import { OperatorForm_formChange$key } from "__generated__/OperatorForm_formChange.graphql";
import { useDeleteFormChange } from "mutations/FormChange/deleteFormChange";
import { useRouter } from "next/router";

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

  const router = useRouter();

  const [deleteFormChange, isDeletingFormChange] = useDeleteFormChange();

  const { newFormData } = formChange;

  const handleDiscard = () => {
    deleteFormChange({
      variables: {
        input: {
          id: formChange.id,
        },
      },
      onCompleted: () => {
        return router.push(getOperatorsPageRoute());
      },
    });
  };

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
      <Button
        type="button"
        variant="secondary"
        onClick={handleDiscard}
        disabled={!isDeletingFormChange}
      >
        Discard Changes
      </Button>
    </FormBase>
  );
};

export default OperatorForm;
