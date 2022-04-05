import type { JSONSchema7 } from "json-schema";
import SummaryWithTheme from "lib/theme/SummaryWithTheme";
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

interface Props {
  query: ProjectForm_query$key;
  projectRevision: ProjectForm_projectRevision$key;
}

const SummaryForm: React.FC<Props> = (props) => {
  //   const [updateProjectFormChange, updatingProjectFormChange] =
  //     useUpdateProjectFormChange();

  const revision = useFragment(
    graphql`
      fragment ProjectForm_projectRevision on ProjectRevision {
        projectFormChange {
          id
          newFormData
          updatedAt
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

  //   const uniqueProposalReferenceValidation = (
  //     formData: any,
  //     errors: FormValidation
  //   ) => {
  //     if (revision.projectFormChange.isUniqueValue === false) {
  //       errors.proposalReference.addError(
  //         "A proposal with the same proposal reference already exists. Please specify a different proposal reference."
  //       );
  //     }

  //     return errors;
  //   };

  //   const handleChange = (
  //     changeData: any,
  //     changeStatus: "pending" | "staged"
  //   ) => {
  //     const updatedFormData = {
  //       ...revision.projectFormChange.newFormData,
  //       ...changeData,
  //     };
  //     return new Promise((resolve, reject) =>
  //       updateProjectFormChange({
  //         variables: {
  //           input: {
  //             id: revision.projectFormChange.id,
  //             formChangePatch: {
  //               newFormData: updatedFormData,
  //               changeStatus,
  //             },
  //           },
  //         },
  //         optimisticResponse: {
  //           updateFormChange: {
  //             formChange: {
  //               id: revision.projectFormChange.id,
  //               newFormData: updatedFormData,
  //               isUniqueValue: revision.projectFormChange.isUniqueValue,
  //             },
  //           },
  //         },
  //         onCompleted: resolve,
  //         onError: reject,
  //         debounceKey: revision.projectFormChange.id,
  //       })
  //     );
  //   };

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
        "ui:widget": "ReadOnlyWidget",
        "ui:placeholder": "2020-RFP-1-123-ABCD",
        "bcgov:size": "small",
        "bcgov:help-text": "(e.g. 2020-RFP-1-ABCD-123)",
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

  //   const lastEditedDate = useMemo(
  //     () => new Date(revision.projectFormChange.updatedAt),
  //     [revision.projectFormChange.updatedAt]
  //   );

  //   const handleSubmit = async (e: ISubmitEvent<any>) => {
  //     await handleChange(e.formData, "staged");
  //     props.onSubmit();
  //   };

  return (
    <>
      <header>
        <h2>Project Overview</h2>
        {/* <SavingIndicator
          isSaved={!updatingProjectFormChange}
          lastEdited={lastEditedDate}
        /> */}
      </header>
      <SummaryWithTheme
        {...props}
        schema={schema}
        uiSchema={uiSchema}
        // validate={uniqueProposalReferenceValidation}
        formData={revision.projectFormChange.newFormData}
        formContext={{
          query,
          form: revision.projectFormChange.newFormData,
          operatorCode: selectedOperator?.node?.operatorCode,
        }}
        // widgets={{
        //   SelectRfpWidget: SelectRfpWidget,
        //   SelectProjectStatusWidget: SelectProjectStatusWidget,
        // }}
        // onChange={(change) => handleChange(change.formData, "pending")}
        // onSubmit={handleSubmit}
      >
        {/* <Button type="submit" style={{ marginRight: "1rem" }}>
          Submit Project Overview
        </Button> */}
      </SummaryWithTheme>
    </>
  );
};

export default SummaryForm;
