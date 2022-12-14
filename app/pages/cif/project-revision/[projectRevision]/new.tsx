import { Button } from "@button-inc/bcgov-theme";
import { ISubmitEvent } from "@rjsf/core";
import FormBase from "components/Form/FormBase";
import SelectRfpWidget from "components/Form/SelectRfpWidget";
import DefaultLayout from "components/Layout/DefaultLayout";
import { JSONSchema7 } from "json-schema";
import withRelayOptions from "lib/relay/withRelayOptions";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import { useStageFormChange } from "mutations/FormChange/stageFormChange";
import { useUpdateNewProjectMutation } from "mutations/FormChange/updateNewProject";
import { graphql, useFragment, usePreloadedQuery } from "react-relay/hooks";
import { RelayProps, withRelay } from "relay-nextjs";
import { newProjectRevisionQuery } from "__generated__/newProjectRevisionQuery.graphql";

const schema: JSONSchema7 = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  required: ["fundingStreamRfpId"],
  properties: {
    fundingStreamRfpId: {
      type: "number",
      title: "RFP Year ID",
      default: undefined,
    },
  },
};

const uiSchema = {
  fundingStreamRfpId: {
    "ui:widget": "SelectRfpWidget",
    "ui:options": {
      text: `text`,
      label: true,
    },
  },
};

export const pageQuery = graphql`
  query newProjectRevisionQuery($projectRevision: ID!) {
    session {
      ...DefaultLayout_session
    }
    projectRevision(id: $projectRevision) {
      id
      # eslint-disable-next-line relay/unused-fields
      changeReason
      revisionStatus
      projectFormChange {
        id
        rowId
        newFormData
        isUniqueValue(columnName: "proposalReference")
      }
    }
    ...SelectRfpWidget_query
  }
`;

console.log("pageQuery", pageQuery);

export function ProjectRevisionNew({
  preloadedQuery,
}: RelayProps<{}, newProjectRevisionQuery>) {
  const { session, projectRevision } = usePreloadedQuery(
    pageQuery,
    preloadedQuery
  );

  const [updateNewProject] = useUpdateNewProjectMutation();

  const [stageFormChange] = useStageFormChange();

  const handleChange = (changeData: any) => {
    const updatedFormData = {
      ...projectRevision.projectFormChange.newFormData,
      ...changeData,
    };

    return new Promise((resolve, reject) =>
      updateNewProject({
        variables: {
          input: {
            rowId: projectRevision.projectFormChange.rowId,
            formChangePatch: {
              newFormData: updatedFormData,
            },
          },
        },
        optimisticResponse: {
          updateFormChange: {
            formChange: {
              id: projectRevision.projectFormChange.id,
              newFormData: updatedFormData,
              isUniqueValue: projectRevision.projectFormChange.isUniqueValue,
              changeStatus: "pending",
              projectRevisionByProjectRevisionId: undefined,
            },
          },
        },
        onCompleted: resolve,
        onError: reject,
        debounceKey: projectRevision.projectFormChange.id,
      })
    );
  };

  const handleStage = async (changeData?: any) => {
    return new Promise((resolve, reject) =>
      stageFormChange({
        variables: {
          input: {
            rowId: projectRevision.projectFormChange.rowId,
            formChangePatch: changeData ? { newFormData: changeData } : {},
          },
        },
        optimisticResponse: {
          stageFormChange: {
            formChange: {
              id: projectRevision.projectFormChange.id,
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
    // props.onSubmit();
    //redirect probably
  };

  const handleError = () => {
    handleStage();
  };

  return (
    <>
      <DefaultLayout session={session}>
        <header>
          <h2>New Project</h2>
        </header>
        <FormBase
          tagName={"dl"}
          className="project-revision-view-form"
          schema={schema}
          uiSchema={uiSchema}
          ObjectFieldTemplate={EmptyObjectFieldTemplate}
          formData={projectRevision}
          formContext={{
            query: pageQuery,
            revisionId: projectRevision.id,
            revisionStatus: projectRevision.revisionStatus,
          }}
          id="ProjectRevisionNewForm"
          onChange={(change) => handleChange(change.formData)}
          onSubmit={handleSubmit}
          onError={handleError}
          widgets={{
            SelectRfpWidget: SelectRfpWidget,
          }}
        >
          <Button type="submit" size="small">
            Confirm
          </Button>
          <em>These fields are immutable once selected</em>
        </FormBase>
      </DefaultLayout>
      <style jsx>{`
        div :global(.definition-container) {
          flex-direction: column;
          gap: 0.5rem;
        }
        div :global(.revision-record-history-section) {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        div :global(.revision-record-history-section > dd) {
          margin-bottom: 0;
        }
        div :global(.revision-record-history-section > dd > em) {
          font-weight: bold;
          font-size: 0.9em;
        }
      `}</style>
    </>
  );
}
export default withRelay(ProjectRevisionNew, pageQuery, withRelayOptions);
