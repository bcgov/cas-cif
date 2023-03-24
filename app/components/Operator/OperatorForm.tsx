import { Button } from "@button-inc/bcgov-theme";
import FormBase from "components/Form/FormBase";
import FormComponentProps from "components/Form/Interfaces/FormComponentProps";
import { getOperatorsPageRoute } from "routes/pageRoutes";
import { graphql, useFragment } from "react-relay/hooks";
import { OperatorForm_formChange$key } from "__generated__/OperatorForm_formChange.graphql";
// import { OperatorForm_query$key } from "__generated__/OperatorForm_query.graphql";
import { useDeleteFormChange } from "mutations/FormChange/deleteFormChange";
import { useRouter } from "next/router";
import { useCommitFormChange } from "mutations/FormChange/commitFormChange";
import SavingIndicator from "components/Form/SavingIndicator";

interface Props extends FormComponentProps {
  formChange: OperatorForm_formChange$key;
  // query: OperatorForm_query$key;
}

const OperatorForm: React.FC<Props> = (props) => {
  const formChange = useFragment(
    graphql`
      fragment OperatorForm_formChange on FormChange {
        id
        rowId
        newFormData
      }
    `,
    props.formChange
  );
  // TODO: fix this.
  // const { operatorFormBySlug } = useFragment(
  //   graphql`
  //     fragment OperatorForm_query on Query {
  //       operatorFormBySlug: formBySlug(slug: "operator") {
  //         jsonSchema
  //       }
  //     }
  //   `,
  //   props.query
  // );

  const router = useRouter();

  const [deleteFormChange, isDeletingFormChange] = useDeleteFormChange();
  const [commitFormChange, isCommittingFormChange] = useCommitFormChange();

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
        <SavingIndicator isSaved={!isCommittingFormChange} />
      </header>
      <FormBase
        {...props}
        id="operator-form"
        formData={newFormData}
        schema={props.schema}
        onSubmit={handleSubmit}
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
