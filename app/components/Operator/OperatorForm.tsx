import { Button } from "@button-inc/bcgov-theme";
import FormBase from "components/Form/FormBase";
import FormComponentProps from "components/Form/Interfaces/FormComponentProps";
import { getOperatorsPageRoute } from "routes/pageRoutes";
import { graphql, useFragment } from "react-relay/hooks";
import { OperatorForm_formChange$key } from "__generated__/OperatorForm_formChange.graphql";
import { useDeleteFormChange } from "mutations/FormChange/deleteFormChange";
import { useRouter } from "next/router";
import { useCommitFormChange } from "mutations/FormChange/commitFormChange";
import SavingIndicator from "components/Form/SavingIndicator";
import { useUpdateFormChange } from "mutations/FormChange/updateFormChange";

interface Props extends FormComponentProps {
  formChange: OperatorForm_formChange$key;
}

const OperatorForm: React.FC<Props> = (props) => {
  const formChange = useFragment(
    graphql`
      fragment OperatorForm_formChange on FormChange {
        id
        rowId
        newFormData
        formDataRecordId
      }
    `,
    props.formChange
  );

  const router = useRouter();

  const [commitFormChange, isCommittingFormChange] = useCommitFormChange();
  const [deleteFormChange, isDeletingFormChange] = useDeleteFormChange();
  const [updateFormChange, isUpdatingFormChange] = useUpdateFormChange();

  const { newFormData } = formChange;
  const isEditing = formChange.formDataRecordId !== null;

  const handleChange = ({ formData }) => {
    updateFormChange({
      variables: {
        input: {
          rowId: formChange.rowId,
          formChangePatch: {
            newFormData: formData,
          },
        },
      },
      optimisticResponse: {
        updateFormChange: {
          formChange: {
            id: formChange.id,
            newFormData: formData,
            changeStatus: "pending",
          },
        },
      },
      debounceKey: formChange.id,
    });
  };
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

  const handleSubmit = ({ formData }) => {
    commitFormChange({
      variables: {
        input: {
          rowId: formChange.rowId,
          formChangePatch: {
            newFormData: formData,
          },
        },
      },
      onCompleted: () => {
        return router.push(getOperatorsPageRoute());
      },
    });
  };

  return (
    <>
      {" "}
      <header>
        <h2>
          {isEditing ? "Edit" : "New"} {"Operator"}
          <SavingIndicator
            isSaved={!isUpdatingFormChange && !isCommittingFormChange}
          />
        </h2>
      </header>
      <FormBase
        {...props}
        id="operator-form"
        formData={newFormData}
        schema={props.schema}
        onSubmit={handleSubmit}
        onChange={handleChange}
        disabled={isDeletingFormChange}
      >
        <Button type="submit" style={{ marginRight: "1rem" }}>
          Submit
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={handleDiscard}
          disabled={isDeletingFormChange}
        >
          Discard Changes
        </Button>
      </FormBase>
    </>
  );
};

export default OperatorForm;
