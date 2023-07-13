import ProjectContactFormSummary from "components/Form/ProjectContactFormSummary";
import ProjectFormSummary from "components/Form/ProjectFormSummary";
import ProjectManagerFormSummary from "components/Form/ProjectManagerFormSummary";
import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { ProjectRevisionQuery } from "__generated__/ProjectRevisionQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button, Textarea } from "@button-inc/bcgov-theme";
import { useUpdateChangeReason } from "mutations/ProjectRevision/updateChangeReason";
import { useDeleteProjectRevisionMutation } from "mutations/ProjectRevision/deleteProjectRevision";
import SavingIndicator from "components/Form/SavingIndicator";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  getProjectsPageRoute,
  getProjectRevisionFormPageRoute,
  getProjectRevisionPageRoute,
} from "routes/pageRoutes";
import useRedirectTo404IfFalsy from "hooks/useRedirectTo404IfFalsy";
import TaskList from "components/TaskList";
import { useMemo } from "react";
import { TaskListMode } from "components/TaskList/types";
import ProjectQuarterlyReportFormSummary from "components/Form/ProjectQuarterlyReportFormSummary";
import ProjectAnnualReportFormSummary from "components/Form/ProjectAnnualReportFormSummary";
import ProjectMilestoneReportFormSummary from "components/Form/ProjectMilestoneReportFormSummary";
import ProjectFundingAgreementFormSummary from "components/Form/ProjectFundingAgreementFormSummary";
import ProjectEmissionsIntensityReportFormSummary from "components/Form/ProjectEmissionIntensityReportFormSummary";
import ProjectSummaryReportFormSummary from "components/Form/ProjectSummaryReportFormSummary";
import DangerAlert from "lib/theme/ConfirmationAlert";
import { useCommitProjectRevision } from "mutations/ProjectRevision/useCommitProjectRevision";
import ProjectAttachmentsFormSummary from "components/Form/ProjectAttachmentsFormSummary";

const pageQuery = graphql`
  query ProjectRevisionQuery($projectRevision: ID!) {
    query {
      session {
        ...DefaultLayout_session
      }
      projectRevision(id: $projectRevision) {
        id
        rowId
        isFirstRevision
        changeReason
        changeStatus
        projectId
        ...ProjectFormSummary_projectRevision
        ...ProjectContactFormSummary_projectRevision
        ...ProjectManagerFormSummary_projectRevision
        ...ProjectQuarterlyReportFormSummary_projectRevision
        ...ProjectAnnualReportFormSummary_projectRevision
        ...TaskList_projectRevision
        ...ProjectMilestoneReportFormSummary_projectRevision
        ...ProjectFundingAgreementFormSummary_projectRevision
        ...ProjectEmissionIntensityReportFormSummary_projectRevision
        ...ProjectSummaryReportFormSummary_projectRevision
        ...ProjectAttachmentsFormSummary_projectRevision
        projectByProjectId {
          latestCommittedProjectRevision {
            id
          }
        }
        projectFormChange {
          asProject {
            fundingStreamRfpByFundingStreamRfpId {
              fundingStreamByFundingStreamId {
                name
              }
            }
          }
        }

        formChangesByProjectRevisionId {
          edges {
            node {
              validationErrors
            }
          }
        }
      }
      ...ProjectFundingAgreementFormSummary_query
    }
  }
`;
export function ProjectRevision({
  preloadedQuery,
}: RelayProps<{}, ProjectRevisionQuery>) {
  const router = useRouter();
  const [showDiscardConfirmation, setShowDiscardConfirmation] = useState(false);
  const { query } = usePreloadedQuery(pageQuery, preloadedQuery);
  const [updateChangeReason, updatingChangeReason] = useUpdateChangeReason();

  const [commitProjectRevision, committingProjectRevision] =
    useCommitProjectRevision();
  const [discardProjectRevision, discardingProjectRevision] =
    useDeleteProjectRevisionMutation();

  const hasValidationErrors = useMemo(
    () =>
      query.projectRevision?.formChangesByProjectRevisionId.edges.some(
        (edge) => edge.node.validationErrors.length > 0
      ),
    [query.projectRevision?.formChangesByProjectRevisionId.edges]
  );
  const isCommittedRevision =
    query.projectRevision?.changeStatus === "committed";
  useEffect(() => {
    if (isCommittedRevision)
      router.push(getProjectRevisionFormPageRoute(query.projectRevision.id, 0));
    // having isCommittedRevision or query in the dependency array causes `getProjectRevisionFormPageRoute` to be called before the
    // `getProjectsPageRoute` when the project is committed.(we have changeStatus in the payload of the commitProjectRevision mutation and that triggers the useEffect)
  }, [router]);

  const isRedirecting = useRedirectTo404IfFalsy(query.projectRevision);
  if (isRedirecting || isCommittedRevision) return null;

  /**
   *  Function: approve staged change, trigger an insert on the project
   *  table & redirect to the project page
   */
  const commitProject = async () => {
    commitProjectRevision({
      variables: {
        input: {
          revisionToCommitId: query.projectRevision.rowId,
        },
      },
      onCompleted: async () => {
        await router.push(getProjectsPageRoute());
      },
      updater: (store) => {
        // Invalidate the entire store,to make sure that we don't display any stale data after redirecting to the next page.
        // This could be optimized to only invalidate the affected records.
        store.invalidateStore();
      },
    });
  };

  const handleChange = (e) => {
    return new Promise((resolve, reject) =>
      updateChangeReason({
        variables: {
          input: {
            id: query.projectRevision.id,
            projectRevisionPatch: { changeReason: e.target.value },
          },
        },
        optimisticResponse: {
          updateProjectRevision: {
            projectRevision: {
              id: query.projectRevision.id,
              changeReason: e.target.value,
            },
          },
        },
        onCompleted: resolve,
        onError: reject,
        debounceKey: query.projectRevision.id,
      })
    );
  };

  const discardRevision = async () => {
    await discardProjectRevision({
      variables: {
        input: {
          revisionId: query.projectRevision.rowId,
        },
      },
      onCompleted: async () => {
        if (query.projectRevision.isFirstRevision)
          await router.push(getProjectsPageRoute());
        else
          await router.push(
            getProjectRevisionPageRoute(
              query.projectRevision.projectByProjectId
                .latestCommittedProjectRevision.id
            )
          );
      },
      onError: async (e) => {
        console.error("Error discarding the project", e);
      },
    });
  };

  let mode: TaskListMode;
  if (!query.projectRevision?.projectId) mode = "create";
  else if (query.projectRevision.changeStatus === "committed") mode = "view";
  else mode = "update";

  const taskList = (
    <TaskList projectRevision={query.projectRevision} mode={mode} />
  );

  const fundingStream =
    query.projectRevision.projectFormChange.asProject
      .fundingStreamRfpByFundingStreamRfpId.fundingStreamByFundingStreamId.name;

  return (
    <DefaultLayout session={query.session} leftSideNav={taskList}>
      <div>
        <header>
          <h2>Review and Submit Project</h2>
          {showDiscardConfirmation && (
            <DangerAlert
              onProceed={discardRevision}
              onCancel={() => setShowDiscardConfirmation(false)}
              alertText="All changes made will be permanently deleted."
            />
          )}
          {!showDiscardConfirmation && (
            <Button
              id="discard-project-button"
              size="small"
              variant="secondary"
              onClick={() => setShowDiscardConfirmation(true)}
              disabled={committingProjectRevision || discardingProjectRevision}
            >
              <FontAwesomeIcon icon={faTrash} id="discard-project-icon" />
              Discard Project Revision
            </Button>
          )}
        </header>
        <ProjectFormSummary projectRevision={query.projectRevision} />
        <ProjectManagerFormSummary projectRevision={query.projectRevision} />
        <ProjectContactFormSummary projectRevision={query.projectRevision} />
        <ProjectFundingAgreementFormSummary
          projectRevision={query.projectRevision}
          query={query}
        />
        <ProjectMilestoneReportFormSummary
          projectRevision={query.projectRevision}
        />

        {fundingStream == "EP" && (
          <>
            <ProjectQuarterlyReportFormSummary
              projectRevision={query.projectRevision}
            />
            <ProjectEmissionsIntensityReportFormSummary
              projectRevision={query.projectRevision}
            />
            <ProjectAnnualReportFormSummary
              projectRevision={query.projectRevision}
            />
          </>
        )}
        {fundingStream == "IA" && (
          <ProjectSummaryReportFormSummary
            projectRevision={query.projectRevision}
          />
        )}
        <ProjectAttachmentsFormSummary
          projectRevision={query.projectRevision}
        />

        {query.projectRevision.projectId && (
          <div>
            {query.projectRevision.changeStatus === "committed" ? (
              <>
                <h4>Reason for change</h4>
                <p>{query.projectRevision.changeReason}</p>
              </>
            ) : (
              <>
                <h4>Please describe the reason for these changes</h4>
                <SavingIndicator isSaved={!updatingChangeReason} />
                <Textarea
                  value={query.projectRevision.changeReason}
                  onChange={handleChange}
                  size={"medium"}
                  resize="vertical"
                />
              </>
            )}
          </div>
        )}
        {query.projectRevision.changeStatus !== "committed" && (
          <>
            <Button
              size="medium"
              variant="primary"
              onClick={commitProject}
              disabled={
                hasValidationErrors ||
                committingProjectRevision ||
                discardingProjectRevision ||
                updatingChangeReason ||
                (query.projectRevision.projectId &&
                  !query.projectRevision.changeReason)
              }
            >
              Submit
            </Button>
          </>
        )}
      </div>
      <style jsx>{`
        div :global(.pg-button) {
          margin-right: 3em;
        }
        :global(textarea) {
          width: 100%;
          min-height: 10rem;
        }
        div :global(.pg-textarea) {
          padding-top: 2px;
        }
        h4 {
          margin-bottom: 0;
        }
        header {
          margin-bottom: 1rem;
        }
      `}</style>
    </DefaultLayout>
  );
}

export default withRelay(ProjectRevision, pageQuery, withRelayOptions);
