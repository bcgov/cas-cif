import type { JSONSchema7 } from "json-schema";
import FormBase from "../Form/FormBase";
import { graphql, useFragment } from "react-relay";
import { useMemo } from "react";
import { ApplicationOverviewForm_projectRevision$key } from "__generated__/ApplicationOverviewForm_projectRevision.graphql";
import { ISubmitEvent } from "@rjsf/core";
import { useUpdateProjectFormChange } from "mutations/FormChange/updateProjectFormChange";
import { Button } from "@button-inc/bcgov-theme";
import SavingIndicator from "./SavingIndicator";
import UndoChangesButton from "./UndoChangesButton";
import { useStageFormChange } from "mutations/FormChange/stageFormChange";
import ReadOnlyWidget from "lib/theme/widgets/ReadOnlyWidget";
import externalSchema from "data/jsonSchemaForm/externalSchema";

interface Props {
  projectRevision: ApplicationOverviewForm_projectRevision$key;
  onSubmit: () => void;
}

const ApplicationOverviewForm: React.FC<Props> = (props) => {
  const [updateProjectFormChange, updatingProjectFormChange] =
    useUpdateProjectFormChange();

  const [stageFormChange, stagingFormChange] = useStageFormChange();

  const revision = useFragment(
    graphql`
      fragment ApplicationOverviewForm_projectRevision on ProjectRevision {
        projectFormChange {
          id
          rowId
          newFormData
          changeStatus
          asProject {
            fundingStreamRfpByFundingStreamRfpId {
              year
              fundingStreamByFundingStreamId {
                description
              }
            }
          }
        }
      }
    `,
    props.projectRevision
  );

  const uiSchema = useMemo(() => {
    const rfpDescription =
      revision.projectFormChange.asProject.fundingStreamRfpByFundingStreamRfpId
        .fundingStreamByFundingStreamId.description;
    const rfpYear =
      revision.projectFormChange.asProject.fundingStreamRfpByFundingStreamRfpId
        .year;
    const rfpStream = `${rfpDescription} - ${rfpYear}`;
    return {
      "ui:order": ["fundingStreamRfpId", "projectName", "legalName"],
      fundingStreamRfpId: {
        "ui:widget": "SelectRfpWidget",
        "ui:options": {
          text: rfpStream,
          label: rfpStream ? true : false,
        },
      },
      projectName: {
        "ui:widget": "TextWidget",
        title: "Project Name",
      },
      legalName: {
        "ui:widget": "TextWidget",
        title: "Legal Name",
      },
    };
  }, [
    revision.projectFormChange.asProject.fundingStreamRfpByFundingStreamRfpId
      .fundingStreamByFundingStreamId.description,
    revision.projectFormChange.asProject.fundingStreamRfpByFundingStreamRfpId
      .year,
  ]);

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
        <h2>Application Overview</h2>
        <UndoChangesButton formChangeIds={[revision.projectFormChange.rowId]} />
        <SavingIndicator
          isSaved={!updatingProjectFormChange && !stagingFormChange}
        />
      </header>

      <FormBase
        {...props}
        schema={externalSchema as JSONSchema7}
        uiSchema={uiSchema}
        validateOnMount={revision.projectFormChange.changeStatus === "staged"}
        formData={revision.projectFormChange.newFormData}
        widgets={{
          SelectRfpWidget: ReadOnlyWidget,
        }}
        onChange={(change) => handleChange(change.formData)}
        onSubmit={handleSubmit}
        onError={handleError}
      >
        <Button type="submit" style={{ marginRight: "1rem" }}>
          Submit Application Overview
        </Button>
      </FormBase>
    </>
  );
};

export default ApplicationOverviewForm;
