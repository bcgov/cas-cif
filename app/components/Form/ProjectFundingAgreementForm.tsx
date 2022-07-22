import {
  fundingAgreementSchema,
  fundingAgreementUiSchema,
} from "data/jsonSchemaForm/fundingAgreementSchema";
import { JSONSchema7 } from "json-schema";
import { graphql, useFragment } from "react-relay";
import FormBase from "./FormBase";
import { ProjectFundingAgreementForm_projectRevision$key } from "__generated__/ProjectFundingAgreementForm_projectRevision.graphql";
import { Button } from "@button-inc/bcgov-theme";
import { useCreateFundingParameterFormChange } from "mutations/FundingParameter/createFundingParameterFormChange";
import { useUpdateFundingParameterFormChange } from "mutations/FundingParameter/updateFundingParameterFormChange";
import UndoChangesButton from "./UndoChangesButton";
import SavingIndicator from "./SavingIndicator";
interface Props {
  projectRevision: ProjectFundingAgreementForm_projectRevision$key;
  viewOnly?: boolean;
  onSubmit: () => void;
}

const ProjectFundingAgreementForm: React.FC<Props> = (props) => {
  // Mutations
  const [createFundingParameterFormChange, isAddingFundingParameterFormChange] =
    useCreateFundingParameterFormChange();
  const [
    updateFundingParameterFormChange,
    isUpdatingFundingParameterFormChange,
  ] = useUpdateFundingParameterFormChange();

  const projectRevision = useFragment(
    graphql`
      fragment ProjectFundingAgreementForm_projectRevision on ProjectRevision {
        id
        rowId
        projectFormChange {
          formDataRecordId
        }
        projectFundingAgreementFormChanges: formChangesFor(
          first: 500
          formDataTableName: "funding_parameter"
          filter: { operation: { notEqualTo: ARCHIVE } }
        ) @connection(key: "connection_projectFundingAgreementFormChanges") {
          __id
          edges {
            node {
              id
              rowId
              newFormData
              changeStatus
            }
          }
        }
      }
    `,
    props.projectRevision
  );

  const fundingAgreement =
    projectRevision.projectFundingAgreementFormChanges.edges[0]?.node;

  const addFundingAgreement = () => {
    createFundingParameterFormChange({
      variables: {
        input: {
          projectRevisionId: projectRevision.rowId,
          formDataSchemaName: "cif",
          formDataTableName: "funding_parameter",
          jsonSchemaName: "funding_parameter",
          operation: "CREATE",
          newFormData: {
            projectId: projectRevision.projectFormChange.formDataRecordId,
            provinceSharePercentage: 50, // Default to 50%
            holdbackPercentage: 10, // Default to 10%
          },
        },
        connections: [projectRevision.projectFundingAgreementFormChanges.__id],
      },
    });
  };

  const handleChange = (formData, changeStatus: "staged" | "pending") => {
    // don't trigger a change if the form data is an empty object
    if (formData && Object.keys(formData).length === 0) return;

    if (fundingAgreement) {
      const updatedFormData = {
        ...fundingAgreement.newFormData,
        ...formData,
      };
      updateFundingParameterFormChange({
        variables: {
          input: {
            id: fundingAgreement.id,
            formChangePatch: {
              newFormData: updatedFormData,
              changeStatus: changeStatus,
            },
          },
        },
        optimisticResponse: {
          updateFormChange: {
            formChange: {
              id: fundingAgreement.id,
              newFormData: updatedFormData,
              changeStatus: changeStatus,
            },
          },
        },
        debounceKey: fundingAgreement.id,
      });
    }
  };

  const handleSubmit = async ({ formData }) => {
    await handleChange(formData, "staged");
    props.onSubmit();
  };

  const handleError = () => {
    handleChange(fundingAgreement.newFormData, "staged");
  };

  return (
    <>
      {projectRevision.projectFundingAgreementFormChanges.edges.length ===
        0 && (
        <Button onClick={addFundingAgreement} style={{ marginRight: "1rem" }}>
          Add Funding Agreement
        </Button>
      )}
      {projectRevision.projectFundingAgreementFormChanges.edges.length > 0 && (
        <>
          <header>
            <h3>Project Funding Agreement</h3>
            <UndoChangesButton formChangeIds={[fundingAgreement?.rowId]} />
            <SavingIndicator
              isSaved={
                !isUpdatingFundingParameterFormChange &&
                !isAddingFundingParameterFormChange
              }
            />
          </header>

          <FormBase
            id="ProjectFundingAgreementForm"
            validateOnMount={fundingAgreement?.changeStatus === "staged"}
            idPrefix="ProjectFundingAgreementForm"
            schema={fundingAgreementSchema as JSONSchema7}
            formData={fundingAgreement?.newFormData}
            formContext={{
              form: fundingAgreement?.newFormData,
            }}
            uiSchema={fundingAgreementUiSchema}
            onChange={(change) => handleChange(change.formData, "pending")}
            onSubmit={handleSubmit}
            onError={handleError}
          >
            <Button
              type="submit"
              style={{ marginRight: "1rem" }}
              disabled={
                isUpdatingFundingParameterFormChange ||
                isAddingFundingParameterFormChange
              }
            >
              Submit Project Funding Agreement
            </Button>
          </FormBase>
        </>
      )}
    </>
  );
};

export default ProjectFundingAgreementForm;
