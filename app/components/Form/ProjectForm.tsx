import type { JSONSchema7 } from "json-schema";
import FormBase from "../Form/FormBase";
import { graphql, useFragment } from "react-relay";
import type { ProjectForm_query$key } from "__generated__/ProjectForm_query.graphql";
import { useMemo } from "react";
import SelectRfpWidget from "components/Form/SelectRfpWidget";
import SelectProjectStatusWidget from "./SelectProjectStatusWidget";
import projectSchema from "data/jsonSchemaForm/projectSchema";
import { ProjectForm_projectRevision$key } from "__generated__/ProjectForm_projectRevision.graphql";
import { FormValidation, ISubmitEvent } from "@rjsf/core";
import { useUpdateProjectFormChange } from "mutations/FormChange/updateProjectFormChange";
import { Button } from "@button-inc/bcgov-theme";
import SavingIndicator from "./SavingIndicator";
import UndoChangesButton from "./UndoChangesButton";
import { useStageFormChange } from "mutations/FormChange/stageFormChange";

interface Props {
  query: ProjectForm_query$key;
  projectRevision: ProjectForm_projectRevision$key;
  onSubmit: () => void;
}
// You only need to include the optional arguments when using this function to create the schema for the summary (read-only) page.
export const createProjectUiSchema = (
  legalName?,
  bcRegistryId?,
  rfpStream?,
  projectStatus?
) => {
  return {
    "ui:order": [
      "fundingStreamRfpId",
      "proposalReference",
      "projectName",
      "score",
      "rank",
      "projectStatus",
      "projectStatusId",
      "summary",
      "projectType",
      "sectorName",
      "additionalSectorInformation",
      "operatorId",
      "operatorTradeName",
      "totalFundingRequest",
      "comments",
    ],
    proposalReference: {
      "ui:help": <small>(e.g. 2020-RFP-1-ABCD-123)</small>,
    },
    totalFundingRequest: {
      "ui:widget": "NumberWidget",
      isMoney: true,
    },
    summary: {
      "ui:widget": "TextAreaWidget",
    },
    projectType: {
      "ui:placeholder": "Select a Project Type",
      "ui:widget": "SearchWidget",
    },
    operatorId: {
      "ui:placeholder": "Select an Operator",
      "ui:widget": "SearchWidget",
      "ui:options": {
        text: `${
          (legalName ? `${legalName}` : "") +
          (bcRegistryId ? ` (${bcRegistryId})` : "")
        }`,
      },
    },
    fundingStreamRfpId: {
      "ui:widget": "SelectRfpWidget",
      "ui:options": {
        text: `${rfpStream}`,
        label: rfpStream ? true : false,
      },
    },
    projectStatusId: {
      "ui:placeholder": "Select a Project Status",
      "ui:widget": "SelectProjectStatusWidget",
      "ui:options": {
        text: `${projectStatus}`,
      },
    },
    sectorName: {
      "ui:placeholder": "Select a Sector",
      "ui:widget": "SearchWidget",
    },
    additionalSectorInformation: {
      "ui:widget": "TextAreaWidget",
    },
    score: {
      "ui:widget": "NumberWidget",
      numberOfDecimalPlaces: 3,
    },
    rank: {
      "ui:widget": "ReadOnlyCalculatedValueWidget",
      calculatedValueFormContextProperty: "calculatedRank",
      hideOptional: true,
    },
    comments: {
      "ui:widget": "TextAreaWidget",
    },
  };
};

const ProjectForm: React.FC<Props> = (props) => {
  const [updateProjectFormChange, updatingProjectFormChange] =
    useUpdateProjectFormChange();

  const [stageFormChange, stagingFormChange] = useStageFormChange();

  const revision = useFragment(
    graphql`
      fragment ProjectForm_projectRevision on ProjectRevision {
        projectFormChange {
          id
          rowId
          newFormData
          changeStatus
          isUniqueValue(columnName: "proposalReference")
          projectRevisionByProjectRevisionId {
            rank
          }
        }
      }
    `,
    props.projectRevision
  );

  const query = useFragment(
    graphql`
      fragment ProjectForm_query on Query {
        allOperators {
          edges {
            node {
              rowId
              legalName
              tradeName
              bcRegistryId
              operatorCode
            }
          }
        }
        allSectors {
          edges {
            node {
              sectorName
            }
          }
        }
        allProjectTypes(orderBy: PRIMARY_KEY_ASC) {
          edges {
            node {
              name
            }
          }
        }
        ...SelectRfpWidget_query
        ...SelectProjectStatusWidget_query
      }
    `,
    props.query
  );
  let selectedOperator = useMemo(() => {
    return query.allOperators.edges.find(
      ({ node }) =>
        node.rowId === revision.projectFormChange.newFormData?.operatorId
    );
  }, [query, revision.projectFormChange.newFormData?.operatorId]);

  const uiSchema = useMemo(() => {
    return createProjectUiSchema(
      selectedOperator ? selectedOperator.node.tradeName : ""
    );
  }, [selectedOperator]);

  const uniqueProposalReferenceValidation = (
    formData: any,
    errors: FormValidation
  ) => {
    if (revision.projectFormChange.isUniqueValue === false) {
      errors.proposalReference.addError(
        "This proposal reference already exists, please specify a different one."
      );
    }

    return errors;
  };

  const handleChange = (changeData: any) => {
    const updatedFormData = {
      ...revision.projectFormChange.newFormData,
      ...changeData,
    };

    return new Promise((resolve, reject) =>
      updateProjectFormChange({
        variables: {
          input: {
            rowId: revision.projectFormChange.rowId,
            formChangePatch: {
              newFormData: updatedFormData,
            },
          },
        },
        optimisticResponse: {
          updateFormChange: {
            formChange: {
              id: revision.projectFormChange.id,
              newFormData: updatedFormData,
              isUniqueValue: revision.projectFormChange.isUniqueValue,
              changeStatus: "pending",
              projectRevisionByProjectRevisionId: undefined,
            },
          },
        },
        onCompleted: resolve,
        onError: reject,
        debounceKey: revision.projectFormChange.id,
      })
    );
  };

  const handleStage = async (changeData?: any) => {
    return new Promise((resolve, reject) =>
      stageFormChange({
        variables: {
          input: {
            rowId: revision.projectFormChange.rowId,
            formChangePatch: changeData ? { newFormData: changeData } : {},
          },
        },
        optimisticResponse: {
          stageFormChange: {
            formChange: {
              id: revision.projectFormChange.id,
              changeStatus: "staged",
              newFormData: changeData,
            },
          },
        },
        onCompleted: resolve,
        onError: reject,
      })
    );
  };

  const schema: JSONSchema7 = useMemo(() => {
    const initialSchema = {
      ...projectSchema,
      properties: {
        ...projectSchema.properties,
        operatorId: {
          ...projectSchema.properties.operatorId,
          anyOf: query.allOperators.edges.map(({ node }) => {
            return {
              type: "number",
              title: `${node.legalName} ${
                node.bcRegistryId ? `(${node.bcRegistryId})` : ""
              }`,
              enum: [node.rowId],
              value: node.rowId,
            };
          }),
        },
        sectorName: {
          ...projectSchema.properties.sectorName,
          anyOf: query.allSectors.edges.map(({ node }) => {
            return {
              type: "string",
              title: node.sectorName,
              enum: [node.sectorName],
              value: node.sectorName,
            };
          }),
        },
        projectType: {
          ...projectSchema.properties.projectType,
          anyOf: query.allProjectTypes.edges.map(({ node }) => {
            return {
              type: "string",
              title: node.name,
              enum: [node.name],
              value: node.name,
            };
          }),
        },
      },
    };
    return initialSchema as JSONSchema7;
  }, [query]);

  const handleSubmit = async (e: ISubmitEvent<any>) => {
    await handleStage(e.formData);
    props.onSubmit();
  };

  const handleError = () => {
    handleStage();
  };

  return (
    <>
      <header>
        <h2>Project Overview</h2>
        <UndoChangesButton formChangeIds={[revision.projectFormChange.rowId]} />
        <SavingIndicator
          isSaved={!updatingProjectFormChange && !stagingFormChange}
        />
      </header>

      <FormBase
        {...props}
        schema={schema}
        uiSchema={uiSchema}
        validateOnMount={revision.projectFormChange.changeStatus === "staged"}
        validate={uniqueProposalReferenceValidation}
        formData={revision.projectFormChange.newFormData}
        formContext={{
          query,
          form: revision.projectFormChange.newFormData,
          operatorCode: selectedOperator?.node?.operatorCode,
          calculatedRank:
            revision.projectFormChange.projectRevisionByProjectRevisionId
              .rank ?? null,
        }}
        widgets={{
          SelectRfpWidget: SelectRfpWidget,
          SelectProjectStatusWidget: SelectProjectStatusWidget,
        }}
        onChange={(change) => handleChange(change.formData)}
        onSubmit={handleSubmit}
        onError={handleError}
      >
        <Button type="submit" style={{ marginRight: "1rem" }}>
          Submit Project Overview
        </Button>
      </FormBase>
    </>
  );
};

export default ProjectForm;
