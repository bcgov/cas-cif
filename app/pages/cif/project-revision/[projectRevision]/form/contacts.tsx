import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { contactsFormQuery } from "__generated__/contactsFormQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import { useRouter } from "next/router";
import { Button } from "@button-inc/bcgov-theme";
import { useMemo, useRef } from "react";
import SavingIndicator from "components/Form/SavingIndicator";
import { mutation as updateProjectRevisionMutation } from "mutations/ProjectRevision/updateProjectRevision";
import { useMutation } from "react-relay";
import { getProjectsPageRoute } from "pageRoutes";
import ProjectContactForm from "components/Form/ProjectContactForm";
import { ISupportExternalValidation } from "components/Form/Interfaces/FormValidationTypes";
import TaskList from "components/TaskList";

const pageQuery = graphql`
  query contactsFormQuery($projectRevision: ID!) {
    query {
      session {
        ...DefaultLayout_session
      }
      projectRevision(id: $projectRevision) {
        id
        updatedAt
        ...ProjectContactForm_projectRevision
        ...TaskList_projectRevision
      }
      ...ProjectContactForm_query
    }
  }
`;

export function ProjectRevision({
  preloadedQuery,
}: RelayProps<{}, contactsFormQuery>) {
  const projectContactFormRef = useRef<ISupportExternalValidation>(null);

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
    const errors = [...projectContactFormRef.current.selfValidate()];

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

  const taskList = <TaskList projectRevision={query.projectRevision} />;

  return (
    <DefaultLayout session={query.session} leftSideNav={taskList}>
      <header>
        <h2>Project Overview</h2>
        <SavingIndicator
          isSaved={!updatingProjectRevision}
          lastEdited={lastEditedDate}
        />
      </header>

      <ProjectContactForm
        query={query}
        projectRevision={query.projectRevision}
        setValidatingForm={(validator) =>
          (projectContactFormRef.current = validator)
        }
      />

      <Button
        size="medium"
        variant="primary"
        onClick={commitProject}
        disabled={updatingProjectRevision}
      >
        Submit
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
