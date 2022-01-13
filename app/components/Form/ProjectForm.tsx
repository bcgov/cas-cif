import type { JSONSchema7 } from "json-schema";
import FormBase from "../Form/FormBase";
import FormComponentProps from "../Form/FormComponentProps";
import { graphql, useFragment } from "react-relay";
import type { ProjectForm_query$key } from "__generated__/ProjectForm_query.graphql";
import { useMemo } from "react";
import SelectRfpWidget from "components/Form/SelectRfpWidget";
import SelectProjectStatusWidget from "./SelectProjectStatusWidget";

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
          ...SelectRfpWidget_query
          ...SelectProjectStatusWidget_query
        }
      }
    `,
    props.query
  );

  let selectedOperator = useMemo(() => {
    return query.allOperators.edges.find(
      ({ node }) => node.rowId === props.formData.operatorId
    );
  }, [query, props.formData.operatorId]);

  const schema: JSONSchema7 = useMemo(() => {
    return {
      type: "object",
      required: [
        "rfpNumber",
        "projectName",
        "summary",
        "operatorId",
        "fundingStreamRfpId",
      ],
      properties: {
        rfpNumber: {
          type: "string",
          title: "RFP Number",
          pattern: "^((\\d{4})-RFP-([1-2])-(\\d{3,4})-([A-Z]{4}))$",
        },
        projectName: { type: "string", title: "Project Name" },
        summary: { type: "string", title: "Summary" },
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
        fundingStreamRfpId: {
          type: "number",
          title: "Funding Stream RFP ID",
          default: undefined,
        },
        projectStatusId: {
          type: "number",
          title: "Project Status",
          default: undefined,
        },
      },
    };
  }, [query]);

  const uiSchema = useMemo(() => {
    return {
      rfpNumber: {
        "ui:placeholder": "2020-RFP-1-456-ABCD",
        "ui:col-md": 12,
        "bcgov:size": "small",
      },
      projectName: {
        "ui:placeholder": "Short project name",
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
      schema={schema}
      uiSchema={uiSchema}
      formContext={{ query, form: props.formData }}
      widgets={{
        SelectRfpWidget: SelectRfpWidget,
        SelectProjectStatusWidget: SelectProjectStatusWidget,
      }}
    />
  );
};

export default ProjectForm;
