import type { JSONSchema7 } from "json-schema";
import FormBase from "../Form/FormBase";
import FormComponentProps from "../Form/FormComponentProps";
import { graphql, useFragment } from "react-relay";
import type { ProjectForm_query$key } from "__generated__/ProjectForm_query.graphql";

interface Props extends FormComponentProps {
  query: ProjectForm_query$key;
}

const ProjectForm: React.FC<Props> = (props) => {
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
              }
            }
          }
          allFundingStreams {
            edges {
              node {
                rowId
                name
                description
              }
            }
          }
        }
      }
    `,
    props.query
  );

  // If there is an operator selected, retrieve it to populate the Trade Name below in the UI Schema.
  let selectedOperator;
  if (props.formData.operatorId) {
    selectedOperator = query.allOperators.edges.find(
      ({ node }) => node.rowId === props.formData.operatorId
    );
  }

  // If there is a funding stream selected, retrieve it to populate the description field below in the UI Schema.
  let selectedFundingStream;
  if (props.formData.fundingStreamId) {
    selectedFundingStream = query.allFundingStreams.edges.find(
      ({ node }) => node.rowId === props.formData.fundingStreamId
    );
  }

  const schema: JSONSchema7 = {
    type: "object",
    required: [
      "rfpNumber", 
      "description", 
      "operatorId", 
      "fundingStreamId"
    ],
    properties: {
      rfpNumber: {
        type: "string",
        title: "RFP Number",
        pattern: "^((\\d{4})-RFP-([1-2])-(\\d{3,4})-([A-Z]{4}))$",
      },
      description: { type: "string", title: "Description" },
      operatorId: {
        type: "number",
        title: "Legal Operator Name and BC Registry ID",
        default: undefined,
        anyOf: query.allOperators.edges.map(({ node }) => {
          return {
            type: "number",
            title: `${node.legalName} (${node.bcRegistryId})`,
            enum: [node.rowId],
            value: node.rowId,
          };
        }),
      },
      operatorTradeName: {
        type: "string",
      },
      fundingStreamId: {
        type: "number",
        title: "Funding Stream ID",
        default: undefined,
        anyOf: query.allFundingStreams.edges.map(({ node }) => {
          return {
            type: "number",
            title: node.name,
            enum: [node.rowId],
            value: node.rowId,
          };
        }),
      },
      fundingStreamDescription: {
        type: "string",
      },
    },
  };

  const uiSchema = {
    rfp_number: {
      "ui:placeholder": "2020-RFP-1-456-ABCD",
      "ui:col-md": 12,
      "bcgov:size": "small",
    },
    description: {
      "ui:placeholder": "describe the project...",
      "ui:col-md": 12,
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
    fundingStreamId: {
      "ui:placeholder": "Select a Funding Stream",
      "ui:widget": "select",
      "ui:col-md": 12,
      "bcgov:size": "small",
    },
    fundingStreamDescription: {
      "ui:col-md": 12,
      "ui:widget": "DisplayOnly",
      "bcgov:size": "large",
      "ui:options": {
        text: `${selectedFundingStream ? selectedFundingStream.node.description : ""}`,
        title: "Description",
      },
    },
  };
  return <FormBase {...props} schema={schema} uiSchema={uiSchema} />;
};

export default ProjectForm;
