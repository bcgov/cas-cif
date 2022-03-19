import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { managersFormQuery } from "__generated__/managersFormQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import { useRouter } from "next/router";
import { Button } from "@button-inc/bcgov-theme";
import { useMemo, useRef } from "react";
import SavingIndicator from "components/Form/SavingIndicator";
import ProjecManagerFormGroup from "components/Form/ProjectManagerFormGroup";
import { mutation as updateProjectRevisionMutation } from "mutations/ProjectRevision/updateProjectRevision";
import { useMutation } from "react-relay";
import { getProjectsPageRoute } from "pageRoutes";
import { ISupportExternalValidation } from "components/Form/Interfaces/FormValidationTypes";

const pageQuery = graphql`
  query managersFormQuery($projectRevision: ID!) {
    query {
      session {
        ...DefaultLayout_session
      }
      projectRevision(id: $projectRevision) {
        id
        updatedAt
        ...ProjectManagerFormGroup_revision
      }
      ...ProjectManagerFormGroup_query
    }
  }
`;

export function ProjectRevision({
  preloadedQuery,
}: RelayProps<{}, managersFormQuery>) {
  const projectManagerFormRef = useRef<ISupportExternalValidation>(null);

  const router = useRouter();
  const { query } = usePreloadedQuery(pageQuery, preloadedQuery);

  const [updateProjectRevision, updatingProjectRevision] = useMutation(
    updateProjectRevisionMutation
  );

  const lastEditedDate = useMemo(
    () => new Date(query.projectRevision.updatedAt),
    [query.projectRevision.updatedAt]
  );

  if (!query.projectRevision.id) return null;

  /**
   *  Function: approve staged change, trigger an insert on the project
   *  table & redirect to the project page
   */
  const commitProject = async () => {
    const errors = [...projectManagerFormRef.current.selfValidate()];

    if (errors.length > 0) {
      console.log("Could not submit a form with errors: ", errors);
      return;
    }

    updateProjectRevision({
      variables: {
        input: {
          id: query.projectRevision.id,
          projectRevisionPatch: { changeStatus: "committed" },
        },
      },
      // No need for an optimistic response
      // Since we navigate away from the page after the mutation is complete
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

  return (
    <DefaultLayout session={query.session} title="CIF Projects Management">
      <header>
        <h2>Project Overview</h2>
        <SavingIndicator
          isSaved={!updatingProjectRevision}
          lastEdited={lastEditedDate}
        />
      </header>

      <ProjecManagerFormGroup
        query={query}
        revision={query.projectRevision}
        projectManagerFormRef={projectManagerFormRef}
        setValidatingForm={(validator) =>
          (projectManagerFormRef.current = validator)
        }
      />

      <Button
        size="medium"
        variant="primary"
        onClick={commitProject}
        disabled={updatingProjectRevision}
      >
        Submit Project Managers
      </Button>

      <style jsx>{`
        header {
          display: flex;
          justify-content: space-between;
          align-items: start;
        }

        :global(.pg-button) {
          margin-right: 3em;
        }
      `}</style>
    </DefaultLayout>
  );
}

export default withRelay(ProjectRevision, pageQuery, withRelayOptions);
