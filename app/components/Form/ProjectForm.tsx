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
      "operatorId",
      "operatorTradeName",
      "proposalReference",
      "projectName",
      "summary",
      "totalFundingRequest",
      "projectStatus",
      "projectStatusId",
    ],
    proposalReference: {
      "bcgov:size": "small",
      "ui:help": <small>(e.g. 2020-RFP-1-ABCD-123)</small>,
    },
    projectName: {
      "ui:col-md": 12,
      "bcgov:size": "small",
    },
    totalFundingRequest: {
      "ui:widget": "MoneyWidget",
      "ui:col-md": 12,
      "bcgov:size": "small",
    },
    summary: {
      "ui:col-md": 12,
      "ui:widget": "TextAreaWidget",
      "bcgov:size": "small",
    },
    operatorId: {
      "ui:placeholder": "Select an Operator",
      "ui:col-md": 12,
      "bcgov:size": "small",
      "ui:widget": "SearchWidget",
      "ui:options": {
        text: `${legalName ? `${legalName} (${bcRegistryId})` : ""}`,
      },
    },
    fundingStreamRfpId: {
      "ui:widget": "SelectRfpWidget",
      "ui:col-md": 12,
      "bcgov:size": "small",
      "ui:options": {
        text: `${rfpStream}`,
        label: rfpStream ? true : false,
      },
    },
    projectStatusId: {
      "ui:placeholder": "Select a Project Status",
      "ui:widget": "SelectProjectStatusWidget",
      "ui:col-md": 12,
      "bcgov:size": "small",
      "ui:options": {
        text: `${projectStatus}`,
      },
    },
  };
};

const ProjectForm: React.FC<Props> = (props) => {
  const [updateProjectFormChange, updatingProjectFormChange] =
    useUpdateProjectFormChange();

  const revision = useFragment(
    graphql`
      fragment ProjectForm_projectRevision on ProjectRevision {
        projectFormChange {
          id
          rowId
          newFormData
          changeStatus
          isUniqueValue(columnName: "proposalReference")
          formChangeByPreviousFormChangeId {
            changeStatus
            newFormData
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

  const handleChange = (
    changeData: any,
    changeStatus: "pending" | "staged"
  ) => {
    const updatedFormData =
      Object.keys(changeData).length === 0
        ? {}
        : {
            ...revision.projectFormChange.newFormData,
            ...changeData,
          };

    return new Promise((resolve, reject) =>
      updateProjectFormChange({
        variables: {
          input: {
            id: revision.projectFormChange.id,
            formChangePatch: {
              newFormData: updatedFormData,
              changeStatus,
            },
          },
        },
        optimisticResponse: {
          updateFormChange: {
            formChange: {
              id: revision.projectFormChange.id,
              newFormData: updatedFormData,
              isUniqueValue: revision.projectFormChange.isUniqueValue,
              changeStatus,
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
              title: `${node.legalName} (${node.bcRegistryId})`,
              enum: [node.rowId],
              value: node.rowId,
            };
          }),
        },
      },
    };
    return initialSchema as JSONSchema7;
  }, [query]);

  const handleSubmit = async (e: ISubmitEvent<any>) => {
    await handleChange(e.formData, "staged");
    props.onSubmit();
  };

  const handleError = () => {
    handleChange(revision.projectFormChange.newFormData, "staged");
  };

  return (
    <>
      <header>
        <h2>Project Overview</h2>
        <UndoChangesButton formChangeIds={[revision.projectFormChange.rowId]} />
        <SavingIndicator isSaved={!updatingProjectFormChange} />
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
        }}
        widgets={{
          SelectRfpWidget: SelectRfpWidget,
          SelectProjectStatusWidget: SelectProjectStatusWidget,
        }}
        onChange={(change) => handleChange(change.formData, "pending")}
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
