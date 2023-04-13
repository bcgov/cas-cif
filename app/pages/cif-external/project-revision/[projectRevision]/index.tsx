import withRelayOptions from "lib/relay/withRelayOptions";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { RelayProps, withRelay } from "relay-nextjs";
import { ProjectRevisionExternalSummaryQuery } from "__generated__/ProjectRevisionExternalSummaryQuery.graphql";
import ExternalLayout from "components/Layout/ExternalLayout";
import ExternalProjectFormSummary from "components/Form/ExternalProjectFormSummary";
import ExternalTaskList from "components/TaskList/ExternalTaskList";
import { Button } from "@button-inc/bcgov-theme";
import { Checkbox } from "@button-inc/bcgov-theme";
import { useState } from "react";
import { useCommitProjectRevision } from "mutations/ProjectRevision/useCommitProjectRevision";
import router from "next/router";
import { getExternalUserLandingPageRoute } from "routes/pageRoutes";

const ExternalCifSummaryQuery = graphql`
  query ProjectRevisionExternalSummaryQuery($projectRevision: ID!) {
    session {
      ...ExternalLayout_session
    }
    projectRevision(id: $projectRevision) {
      rowId
      ...ExternalProjectFormSummary_projectRevision
      ...ExternalTaskList_projectRevision
    }
  }
`;
export function ExternalProjectRevisionSummary({
  preloadedQuery,
}: RelayProps<{}, ProjectRevisionExternalSummaryQuery>) {
  const [acceptedTOS, setAcceptedTOS] = useState(false);

  const { session, projectRevision } = usePreloadedQuery(
    ExternalCifSummaryQuery,
    preloadedQuery
  );
  const taskList = <ExternalTaskList projectRevision={projectRevision} />;

  const [commitProjectRevision, committingProjectRevision] =
    useCommitProjectRevision();
  const commitProject = async () => {
    commitProjectRevision({
      variables: {
        input: {
          revisionToCommitId: projectRevision.rowId,
        },
      },
      onCompleted: async () => {
        await router.push(getExternalUserLandingPageRoute());
      },
      updater: (store) => {
        // Invalidate the entire store,to make sure that we don't display any stale data after redirecting to the next page.
        // This could be optimized to only invalidate the affected records.
        store.invalidateStore();
      },
    });
  };

  return (
    <ExternalLayout session={session} leftSideNav={taskList}>
      <div className="container">
        <h2>Review</h2>
        <p>Review your responses to ensure correct submission.</p>
        <ExternalProjectFormSummary projectRevision={projectRevision} />
        <hr></hr>

        <div className="tos">
          <div>
            <Checkbox
              size="medium"
              onClick={() => setAcceptedTOS(!acceptedTOS)}
            />
          </div>
          By checking this checkbox, I confirm that the information provided is
          correct.
        </div>

        <Button
          size="small"
          onClick={() => {
            commitProject();
          }}
          disabled={!acceptedTOS || committingProjectRevision}
        >
          Save & Continue
        </Button>
      </div>
      <style jsx>{`
        .tos {
          display: flex;
          padding-bottom: 20px;
        }
      `}</style>
    </ExternalLayout>
  );
}

export default withRelay(
  ExternalProjectRevisionSummary,
  ExternalCifSummaryQuery,
  withRelayOptions
);
