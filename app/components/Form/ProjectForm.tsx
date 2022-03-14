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
interface Props extends ValidatingFormProps {
  query: ProjectForm_query$key;
  formData: any;
  onChange: (changeData) => void;
}

const ProjectForm: React.FC<Props> = (props) => {
  const formRef = useRef();

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
      ({ node }) => node.rowId === props.formData.operatorId
    );
  }, [query, props.formData.operatorId]);

  props.setValidatingForm({
    selfValidate: () => {
      const formObject = formRef.current;
      return validateFormWithErrors(formObject);
    },
  });

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
        "rfpNumber",
        "projectName",
        "summary",
        "totalFundingRequest",
        "projectStatus",
        "projectStatusId",
      ],
      rfpNumber: {
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
      formContext={{
        query,
        form: props.formData,
        operatorCode: selectedOperator?.node?.operatorCode,
      }}
      widgets={{
        SelectRfpWidget: SelectRfpWidget,
        SelectProjectStatusWidget: SelectProjectStatusWidget,
      }}
    />
  );
};

export default ProjectForm;
