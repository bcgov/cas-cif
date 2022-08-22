import {
  fundingAgreementSchema,
  fundingAgreementUiSchema,
} from "data/jsonSchemaForm/fundingAgreementSchema";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import { graphql, useFragment } from "react-relay";
import FormBase from "./FormBase";
import { useState } from "react";
import {
  FormChangeOperation,
  ProjectFundingAgreementForm_projectRevision$key,
} from "__generated__/ProjectFundingAgreementForm_projectRevision.graphql";
import { Button, RadioButton } from "@button-inc/bcgov-theme";
import { useCreateFundingParameterFormChange } from "mutations/FundingParameter/createFundingParameterFormChange";
import { useUpdateFundingParameterFormChange } from "mutations/FundingParameter/updateFundingParameterFormChange";
import useDiscardFundingParameterFormChange from "mutations/FundingParameter/discardFundingParameterFormChange";

import UndoChangesButton from "./UndoChangesButton";
import SavingIndicator from "./SavingIndicator";
import DangerAlert from "lib/theme/ConfirmationAlert";
import { useAddAdditionalFundingSourceToRevision } from "mutations/FundingParameter/addAdditionalFundingSourceToRevision";
import additionalFundingSourceSchema from "data/jsonSchemaForm/additionalFundingSourceSchema";
import { useMemo, useRef } from "react";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import useDiscardFormChange from "hooks/useDiscardFormChange";
import { ProjectFundingAgreementForm_query$key } from "__generated__/ProjectFundingAgreementForm_query.graphql";
import { useUpdateAdditionalFundingSourceFormChange } from "mutations/FundingParameter/updateAdditionalFundingSourceFormChange";
import { stageReportFormChanges } from "./Functions/reportingRequirementFormChangeFunctions";
import { useUpdateFormChange } from "mutations/FormChange/updateFormChange";
import FormBorder from "lib/theme/components/FormBorder";
interface Props {
  query: ProjectFundingAgreementForm_query$key;
  projectRevision: ProjectFundingAgreementForm_projectRevision$key;
  viewOnly?: boolean;
  onSubmit: () => void;
}

export const createAdditionalFundingSourceUiSchema = (index: number) => {
  return {
    source: {
      "ui:title": `Additional Funding Source ${index}`,
      "ui:widget": "TextWidget",
    },
    amount: {
      "ui:title": `Additional Funding Amount (Source ${index})`,
      "ui:widget": "NumberWidget",
      isMoney: true,
    },
    status: {
      "ui:title": `Additional Funding Status (Source ${index})`,
      "ui:widget": "SearchWidget",
    },
  };
};

const createAdditionalFundingSourceSchema = (allStatuses) => {
  const schema = additionalFundingSourceSchema;
  schema.properties.status = {
    ...schema.properties.status,
    anyOf: allStatuses.edges.map(({ node }) => {
      return {
        type: "string",
        title: node.statusName,
        enum: [node.statusName],
        value: node.statusName,
      } as JSONSchema7Definition;
    }),
  };

  return schema as JSONSchema7;
};

const ProjectFundingAgreementForm: React.FC<Props> = (props) => {
  const formRefs = useRef<Record<string, any>>({});
  // Mutations
  const [createFundingParameterFormChange, isAddingFundingParameterFormChange] =
    useCreateFundingParameterFormChange();
  const [
    updateFundingParameterFormChange,
    isUpdatingFundingParameterFormChange,
  ] = useUpdateFundingParameterFormChange();
  const [
    discardFundingParameterFormChange,
    isDiscardingFundingParameterFormChange,
  ] = useDiscardFundingParameterFormChange();

  const [addAdditionalFundingSource, isAddingAdditionalFundingSource] =
    useAddAdditionalFundingSourceToRevision();

  const [
    applyUpdateAdditionalFundingSource,
    isUpdatingAdditionalFundingSource,
  ] = useUpdateAdditionalFundingSourceFormChange();

  const [updateFormChange, isUpdatingFormChange] = useUpdateFormChange();

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
        additionalFundingSourceFormChanges: formChangesFor(
          first: 500
          formDataTableName: "additional_funding_source"
        ) @connection(key: "connection_additionalFundingSourceFormChanges") {
          __id
          edges {
            node {
              id
              rowId
              newFormData
              changeStatus
              operation
            }
          }
        }
      }
    `,
    props.projectRevision
  );

  const { allAdditionalFundingSourceStatuses } = useFragment(
    graphql`
      fragment ProjectFundingAgreementForm_query on Query {
        allAdditionalFundingSourceStatuses {
          edges {
            node {
              statusName
            }
          }
        }
      }
    `,
    props.query
  );

  const fundingAgreement =
    projectRevision.projectFundingAgreementFormChanges.edges[0]?.node;

  // We should explicitly filter out archived form changes here (filtering on the fragment doesn't work)
  const filteredAdditionalFundingSourceFormChanges =
    projectRevision.additionalFundingSourceFormChanges.edges.filter(
      ({ node }) => node.operation !== "ARCHIVE"
    );

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

  const handleError = () => {
    handleChange(fundingAgreement.newFormData, "staged");
  };

  const sortedAdditionalFundingSourceForms = useMemo(() => {
    const additionalFundingSourceForms = [
      ...filteredAdditionalFundingSourceFormChanges.map(({ node }) => node),
    ];
    additionalFundingSourceForms.sort(
      (a, b) => a.newFormData.sourceIndex - b.newFormData.sourceIndex
    );
    return additionalFundingSourceForms;
  }, [filteredAdditionalFundingSourceFormChanges]);

  const [discardFormChange] = useDiscardFormChange(
    projectRevision.additionalFundingSourceFormChanges.__id
  );

  const deleteAdditionalFundingSource = (
    formChangeId: string,
    formChangeOperation: FormChangeOperation
  ) => {
    discardFormChange({
      formChange: { id: formChangeId, operation: formChangeOperation },
      onCompleted: () => {
        delete formRefs.current[formChangeId];
      },
    });
  };

  const updateAdditionalFundingSource = (
    formChange: {
      readonly id: string;
      readonly newFormData: any;
      readonly operation: FormChangeOperation;
      readonly changeStatus: string;
    },
    newFormData: any
  ) => {
    applyUpdateAdditionalFundingSource({
      variables: {
        input: {
          id: formChange.id,
          formChangePatch: {
            newFormData,
            changeStatus: formChange?.changeStatus,
          },
        },
      },
      optimisticResponse: {
        updateFormChange: {
          formChange: {
            id: formChange.id,
            newFormData: newFormData,
            changeStatus: formChange?.changeStatus,
          },
        },
      },
      debounceKey: formChange.id,
    });
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
  // Get all form changes ids to get used in the undo changes button
  const formChangeIds = useMemo(() => {
    const additionalFundingSourceFormChangeIds =
      projectRevision.additionalFundingSourceFormChanges.edges.map(
        ({ node }) => node?.rowId
      );
    const fundingAgreementFormChangeId =
      projectRevision.projectFundingAgreementFormChanges.edges[0]?.node?.rowId;
    return [
      ...additionalFundingSourceFormChangeIds,
      fundingAgreementFormChangeId,
    ];
  }, [
    projectRevision.projectFundingAgreementFormChanges,
    projectRevision.additionalFundingSourceFormChanges,
  ]);

  return (
    <>
      {projectRevision.projectFundingAgreementFormChanges.edges.length ===
        0 && (
        <div>
          <h3>Is this a funded project?</h3>
          <RadioButton
            name="funding-agreement"
            label="Yes"
            className="radio-button"
            onClick={addFundingAgreement}
            disabled={isDiscardingFundingParameterFormChange}
          />
          <RadioButton
            name="funding-agreement"
            label="No"
            className="radio-button"
          />
        </div>
      )}
      {projectRevision.projectFundingAgreementFormChanges.edges.length > 0 && (
        <>
          <div>
            <h3>Is this a funded project?</h3>
            <RadioButton
              name="funding-agreement"
              label="Yes"
              className="radio-button"
              checked={true}
            />
            <RadioButton
              name="funding-agreement"
              label="No"
              className="radio-button"
              onClick={() => setShowDiscardConfirmation(true)}
              disabled={isDiscardingFundingParameterFormChange}
              checked={false}
            />
            {showDiscardConfirmation && (
              <DangerAlert
                onProceed={handleDiscard}
                onCancel={() => setShowDiscardConfirmation(false)}
                alertText="All changes made will be deleted."
              />
            )}
          </div>
          <header>
            <h3>Project Funding Agreement</h3>
            <UndoChangesButton
              formChangeIds={formChangeIds}
              formRefs={formRefs}
            />
            <SavingIndicator
              isSaved={
                !isUpdatingFundingParameterFormChange &&
                !isAddingFundingParameterFormChange &&
                !isUpdatingAdditionalFundingSource &&
                !isAddingAdditionalFundingSource
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
            ref={(el) => (formRefs.current[fundingAgreement.id] = el)}
            onChange={(change) => handleChange(change.formData, "pending")}
            onError={handleError}
          ></FormBase>
          <FormBorder title="Additional Funding Sources">
            {sortedAdditionalFundingSourceForms.length > 0 &&
              sortedAdditionalFundingSourceForms.map((formChange, index) => {
                return (
                  <div
                    key={formChange.id}
                    className="additionalFundingSourceSection"
                  >
                    <FormBase
                      id={`form-${formChange.id}`}
                      className="additionalFundingSourceForm"
                      idPrefix="additionalFundingSource"
                      validateOnMount={formChange.changeStatus === "staged"}
                      ref={(el) => (formRefs.current[formChange.id] = el)}
                      schema={createAdditionalFundingSourceSchema(
                        allAdditionalFundingSourceStatuses
                      )}
                      formData={formChange.newFormData}
                      onChange={(change) =>
                        updateAdditionalFundingSource(
                          { ...formChange, changeStatus: "pending" },
                          change.formData
                        )
                      }
                      ObjectFieldTemplate={EmptyObjectFieldTemplate}
                      uiSchema={createAdditionalFundingSourceUiSchema(
                        index + 1
                      )}
                    ></FormBase>
                    <Button
                      variant="secondary"
                      size="small"
                      className="removeButton"
                      onClick={() =>
                        deleteAdditionalFundingSource(
                          formChange.id,
                          formChange.operation
                        )
                      }
                    >
                      Remove
                    </Button>
                  </div>
                );
              })}
            <Button
              variant="secondary"
              onClick={() =>
                addAdditionalFundingSource({
                  variables: {
                    input: {
                      revisionId: projectRevision.rowId,
                      sourceIndex:
                        filteredAdditionalFundingSourceFormChanges.length + 1,
                    },
                    connections: [
                      projectRevision.additionalFundingSourceFormChanges.__id,
                    ],
                  },
                })
              }
              disabled={
                isAddingAdditionalFundingSource ||
                isUpdatingAdditionalFundingSource
              }
            >
              Add Funding Source
            </Button>
          </FormBorder>
          <Button
            type="submit"
            onClick={() =>
              stageReportFormChanges(
                updateFundingParameterFormChange,
                props.onSubmit,
                formRefs,
                [
                  ...projectRevision.projectFundingAgreementFormChanges.edges,
                  ...filteredAdditionalFundingSourceFormChanges,
                ],
                null,
                updateFormChange
              )
            }
            style={{ marginRight: "1rem" }}
            disabled={
              isUpdatingFundingParameterFormChange ||
              isAddingFundingParameterFormChange ||
              isUpdatingFormChange
            }
          >
            Submit Project Funding Agreement
          </Button>
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
          div :global(fieldset) {
            border: 0px !important;
            border-radius: 0.25em !important;
            padding: 2em;
          }
          .additionalFundingSourceSection {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          :global(.additionalFundingSourceForm) {
            flex-grow: 1;
            margin-right: 1rem;
          }
          div :global(button.removeButton) {
            margin-top: -21em;
          }
        `}
      </style>
    </>
  );
};

export default ProjectFundingAgreementForm;
