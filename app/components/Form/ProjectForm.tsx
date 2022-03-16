import type { JSONSchema7 } from "json-schema";
import FormBase from "../Form/FormBase";
import { graphql, useFragment } from "react-relay";
import type { ProjectForm_query$key } from "__generated__/ProjectForm_query.graphql";
import { useMemo, useRef } from "react";
import SelectRfpWidget from "components/Form/SelectRfpWidget";
import SelectProjectStatusWidget from "./SelectProjectStatusWidget";
import projectSchema from "data/jsonSchemaForm/projectSchema";
import { ValidatingFormProps } from "./Interfaces/FormValidationTypes";
import validateFormWithErrors from "lib/helpers/validateFormWithErrors";
import { ProjectForm_projectRevision$key } from "__generated__/ProjectForm_projectRevision.graphql";
import { FormValidation } from "@rjsf/core";
import { UseDebouncedMutationConfig } from "mutations/useDebouncedMutation";
import { Disposable, MutationParameters } from "relay-runtime";
interface Props extends ValidatingFormProps {
  query: ProjectForm_query$key;
  projectRevision: ProjectForm_projectRevision$key;
  updateProjectFormChange: (
    config: UseDebouncedMutationConfig<MutationParameters>
  ) => Disposable;
}

const ProjectForm: React.FC<Props> = (props) => {
  const formRef = useRef();

  const revision = useFragment(
    graphql`
      fragment ProjectForm_projectRevision on ProjectRevision {
        id
        projectFormChange {
          id
          newFormData
          isUniqueValue(columnName: "proposalReference")
        }
      }
    `,
    props.projectRevision
  );

  const { query } = useFragment(
    graphql`
      fragment ProjectForm_query on Query {
        query {
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
      }
    `,
    props.query
  );

  let selectedOperator = useMemo(() => {
    return query.allOperators.edges.find(
      ({ node }) =>
        node.rowId === revision.projectFormChange.newFormData.operatorId
    );
  }, [query, revision.projectFormChange.newFormData.operatorId]);

  props.setValidatingForm({
    selfValidate: () => {
      const formObject = formRef.current;
      return validateFormWithErrors(formObject);
    },
  });

  const uniqueProposalReferenceValidation = (
    formData: any,
    errors: FormValidation
  ) => {
    if (revision.projectFormChange.isUniqueValue === false) {
      errors.proposalReference.addError(
        "Proposal reference already exists in the system."
      );
    }

    return errors;
  };

  const handleChange = (changeData: any) => {
    const updatedFormData = {
      ...revision.projectFormChange.newFormData,
      ...changeData,
    };
    return props.updateProjectFormChange({
      variables: {
        input: {
          id: revision.projectFormChange.id,
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
          },
        },
      },
      debounceKey: revision.projectFormChange.id,
    });
  };

  const schema: JSONSchema7 = useMemo(() => {
    const initialSchema = projectSchema;
    initialSchema.properties.operatorId.anyOf = query.allOperators.edges.map(
      ({ node }) => {
        return {
          type: "number",
          title: `${node.legalName} (${node.bcRegistryId})`,
          enum: [node.rowId],
          value: node.rowId,
        };
      }
    );
    return initialSchema as JSONSchema7;
  }, [query]);

  const uiSchema = useMemo(() => {
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
        "ui:placeholder": "2020-RFP-1-123-ABCD",
        "bcgov:size": "small",
      },
      projectName: {
        "ui:placeholder": "Short project name",
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
      },
      operatorTradeName: {
        "ui:col-md": 12,
        "ui:widget": "DisplayOnly",
        "bcgov:size": "small",
        "ui:options": {
          text: `${selectedOperator ? selectedOperator.node.tradeName : ""}`,
          title: "Trade Name",
        },
      },
      fundingStreamRfpId: {
        "ui:widget": "SelectRfpWidget",
        "ui:col-md": 12,
        "bcgov:size": "small",
      },
      projectStatusId: {
        "ui:placeholder": "Select a Project Status",
        "ui:widget": "SelectProjectStatusWidget",
        "ui:col-md": 12,
        "bcgov:size": "small",
      },
    };
  }, [selectedOperator]);

  return (
    <FormBase
      {...props}
      ref={(el) => (formRef.current = el)}
      schema={schema}
      uiSchema={uiSchema}
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
      onChange={(change) => handleChange(change.formData)}
    />
  );
};

export default ProjectForm;
