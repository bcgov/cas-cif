import {
  fundingAgreementSchema,
  fundingAgreementUiSchema,
} from "data/jsonSchemaForm/fundingAgreementSchema";
import { JSONSchema7 } from "json-schema";
import { graphql, useFragment } from "react-relay";
import FormBase from "./FormBase";
import { useState } from "react";
import { ProjectFundingAgreementForm_projectRevision$key } from "__generated__/ProjectFundingAgreementForm_projectRevision.graphql";
import { Alert, Button, RadioButton } from "@button-inc/bcgov-theme";
import { useCreateFundingParameterFormChange } from "mutations/FundingParameter/createFundingParameterFormChange";
import { useUpdateFundingParameterFormChange } from "mutations/FundingParameter/updateFundingParameterFormChange";
import useDiscardFundingParameterFormChange from "mutations/FundingParameter/discardFundingParameterFormChange";

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
  const [discardFundingParameterFormChange] =
    useDiscardFundingParameterFormChange();

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
  const [showDiscardConfirmation, setShowDiscardConfirmation] = useState(false);

  const handleDiscard = () => {
    setShowDiscardConfirmation(false);
    discardFundingParameterFormChange({
      variables: {
        input: {
          revisionId: projectRevision.rowId,
        },
        connections: [],
        reportType: "funding_parameter",
      },
    });
  };
  return (
    <>
      {projectRevision.projectFundingAgreementFormChanges.edges.length ===
        0 && (
        <div>
          <h3>Is this a funded project?</h3>
          <RadioButton
            name="yes"
            label="Yes"
            className="radio-button"
            onClick={addFundingAgreement}
          />
          <RadioButton name="yes" label="No" className="radio-button" />
        </div>
      )}
      {projectRevision.projectFundingAgreementFormChanges.edges.length > 0 && (
        <>
          <div>
            <h3>Is this a funded project?</h3>
            <RadioButton
              name="yes"
              label="Yes"
              className="radio-button"
              checked={true}
            />
            <RadioButton
              name="yes"
              label="No"
              className="radio-button"
              onClick={() => setShowDiscardConfirmation(true)}
            />
            {showDiscardConfirmation && (
              <Alert variant="danger" size="sm">
                All changes made will be deleted.
                <a onClick={handleDiscard} id="confirm-discard-revision">
                  Proceed
                </a>
                <a onClick={() => setShowDiscardConfirmation(false)}>Cancel</a>
              </Alert>
            )}
          </div>
          <header>
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
      <style jsx>
        {`
          div :global(.radio-button) {
            margin-top: 1rem;
            margin-left: 1rem;
          }
          div {
            margin-bottom: 2rem;
          }
          div :global(#discard-project-icon) {
            color: #323a45;
            margin-right: 0.5em;
          }
          div :global(#discard-project-button) {
            margin-bottom: 1em;
            color: #cd2026;
          }
          div :global(#discard-project-button:hover) {
            background-color: #aeb0b5;
          }
          div :global(.pg-notification) {
            margin-bottom: 1em;
            margin-top: 1em;
          }
          div :global(a) {
            color: #1a5a96;
          }
          div :global(a:hover) {
            text-decoration: none;
            color: blue;
            cursor: pointer;
          }
          div :global(#confirm-discard-revision) {
            margin-left: 2em;
            margin-right: 1em;
          }

          div :global(fieldset) {
            border: 0px !important;
            border-radius: 0.25em !important;
            padding: 2em;
          }
        `}
      </style>
    </>
  );
};

export default ProjectFundingAgreementForm;
