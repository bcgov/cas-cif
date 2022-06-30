import fundingAgreementSchema from "data/jsonSchemaForm/fundingAgreementSchema";
import { JSONSchema7 } from "json-schema";
import { graphql, useFragment } from "react-relay";
import FormBase from "./FormBase";
import { ProjectFundingAgreementForm_projectRevision$key } from "__generated__/ProjectFundingAgreementForm_projectRevision.graphql";
import { Button } from "@button-inc/bcgov-theme";
import { useCreateFundingParameterFormChange } from "mutations/ParameterFunding/createFundingParameterFormChange";
import { useUpdateFundingParameterFormChange } from "mutations/ParameterFunding/updateFundingParameterFormChange";
interface Props {
  projectRevision: ProjectFundingAgreementForm_projectRevision$key;
  viewOnly?: boolean;
  onSubmit: () => void;
}

const ProjectFundingAgreementForm: React.FC<Props> = (props) => {
  const projectRevision = useFragment(
    graphql`
      fragment ProjectFundingAgreementForm_projectRevision on ProjectRevision {
        id
        rowId
        projectFundingAgreementFormChanges: formChangesFor(
          first: 500
          formDataTableName: "funding_parameter"
        ) @connection(key: "connection_projectFundingAgreementFormChanges") {
          __id
          edges {
            node {
              rowId
              id
              newFormData
            }
          }
        }
      }
    `,
    props.projectRevision
  );

  const [createFundingParamterFormChange] =
    useCreateFundingParameterFormChange();

  const [updateFundingParameterFormChange] =
    useUpdateFundingParameterFormChange();

  const uiSchema = {
    totalProjectValue: {
      "ui:widget": "MoneyWidget",
    },
    maxFundingAmount: {
      "ui:widget": "MoneyWidget",
    },
    provinceSharePercentage: {
      "ui:widget": "TextWidget",
    },
    holdbackPercentage: {
      "ui:widget": "TextWidget",
    },
    anticipatedFundingAmount: {
      "ui:widget": "MoneyWidget",
    },
  };

  function addFundingAgreement() {
    console.log("addFundingAgreement");
    createFundingParamterFormChange({
      variables: {
        input: {
          projectRevisionId: projectRevision.rowId,
          formDataSchemaName: "cif",
          formDataTableName: "funding_parameter",
          jsonSchemaName: "funding_parameter",
          operation: "CREATE",
          newFormData: {},
        },
        connections: [projectRevision.projectFundingAgreementFormChanges.__id],
      },
      onCompleted: (response) => {
        console.log(response);
      },
      onError: (error) => {
        console.log(error);
      },
    });
  }

  const handleSubmit = ({ formData }) => {
    console.log("GURJ", "handleSubmit, formdata: ", formData);

    // TODO: get project id properly
    formData.project_id = 1;
    updateFundingParameterFormChange({
      variables: {
        input: {
          id: projectRevision.projectFundingAgreementFormChanges.edges[0]?.node
            ?.id,
          formChangePatch: {
            newFormData: formData,
            changeStatus: "committed",
          },
        },
      },

      onCompleted: () => {
        console.log("GURJ", "handleSubmit: onCompleted");
      },
      onError: (e) => console.log("GURJ", "handleSubmit: error", e),
      debounceKey:
        projectRevision.projectFundingAgreementFormChanges.edges[0]?.node?.id,
    });
  };

  const handleChange = (formChangeData) => {
    console.log("GURJ", "handleChange, formdata: ", formChangeData);
    console.log(
      "GURJ",
      "formchange_id",
      projectRevision.projectFundingAgreementFormChanges.edges[0]?.node?.id
    );
    if (projectRevision.projectFundingAgreementFormChanges.edges.length > 0)
      updateFundingParameterFormChange({
        variables: {
          input: {
            id: projectRevision.projectFundingAgreementFormChanges.edges[0]
              ?.node?.id,
            formChangePatch: {
              newFormData: formChangeData,
              changeStatus: "pending",
            },
          },
        },
        onError: (e) => console.log("GURJ", "handleChange error", e),
        debounceKey:
          projectRevision.projectFundingAgreementFormChanges.edges[0]?.node?.id,
      });
  };

  return (
    <>
      <h3>Project Funding Agreement</h3>
      {projectRevision.projectFundingAgreementFormChanges.edges.length ===
        0 && (
        <Button onClick={addFundingAgreement} style={{ marginRight: "1rem" }}>
          Add Funding Agreement
        </Button>
      )}

      <div key={1} className="reportContainer">
        {projectRevision.projectFundingAgreementFormChanges.edges.length >
          0 && (
          <FormBase
            id="ProjectFundingAgreementForm"
            schema={fundingAgreementSchema as JSONSchema7}
            formData={
              projectRevision.projectFundingAgreementFormChanges.edges[0]?.node
                ?.newFormData
            }
            uiSchema={uiSchema}
            onSubmit={handleSubmit}
            onChange={(change) => handleChange(change.formData)}
          >
            <Button type="submit" style={{ marginRight: "1rem" }}>
              Submit Project Funding Agreement
            </Button>
          </FormBase>
        )}

        <style jsx>{`
          .reportContainer {
            margin-bottom: 1em;
          }
        `}</style>
      </div>
    </>
  );
};

export default ProjectFundingAgreementForm;
