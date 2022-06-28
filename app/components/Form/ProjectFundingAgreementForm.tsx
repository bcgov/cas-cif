import fundingAgreementSchema from "data/jsonSchemaForm/fundingAgreementSchema";
import { JSONSchema7 } from "json-schema";
import { graphql, useFragment } from "react-relay";
import FormBase from "./FormBase";
import { ProjectFundingAgreementForm_projectRevision$key } from "__generated__/ProjectFundingAgreementForm_projectRevision.graphql";
import { Button } from "@button-inc/bcgov-theme";
import { useUpdateReportingRequirementFormChange } from "mutations/ProjectReportingRequirement/updateReportingRequirementFormChange";

import { updateReportFormChange } from "./reportingRequirementFormChangeFunctions";
interface Props {
  projectRevision: ProjectFundingAgreementForm_projectRevision$key;
  viewOnly?: boolean;
  onSubmit: () => void;
}

const ProjectFundingAgreementForm: React.FC<Props> = (props) => {
  const projectRevision = useFragment(
    graphql`
      fragment ProjectFundingAgreementForm_projectRevision on ProjectRevision {
        projectFundingAgreementFormChanges: formChangesFor(
          first: 500
          formDataTableName: "funding_parameter"
        )
      }
    `,
    props.projectRevision
  );
  const [applyUpdateFormChangeMutation] =
    useUpdateReportingRequirementFormChange();
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

  const { formSchema, formData } = {
    formSchema: fundingAgreementSchema,
    formData: null,
  };

  console.log("ProjectFundingAgreementForm", projectRevision);
  console.log(projectRevision.projectFundingAgreementFormChanges);

  return (
    <>
      <h3>Project Funding Agreement</h3>

      <div key={1} className="reportContainer">
        <FormBase
          id="ProjectFundingAgreementForm"
          liveValidate
          schema={formSchema as JSONSchema7}
          formData={formData}
          uiSchema={uiSchema}
          onSubmit={(change) => {
            updateReportFormChange(
              applyUpdateFormChangeMutation,
              "funding_parameter",
              { ...projectRevision, changeStatus: "pending" },
              change.formData
            );
          }}
        >
          <Button type="submit" style={{ marginRight: "1rem" }}>
            Submit Project Funding Agreement
          </Button>
        </FormBase>

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
