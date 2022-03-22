import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { managersFormQuery } from "__generated__/managersFormQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import { Button } from "@button-inc/bcgov-theme";
import { useMemo, useRef } from "react";
import SavingIndicator from "components/Form/SavingIndicator";
import ProjectManagerFormGroup from "components/Form/ProjectManagerFormGroup";
// import { useMutation } from "react-relay";
import { ISupportExternalValidation } from "components/Form/Interfaces/FormValidationTypes";
import TaskList from "components/TaskList";

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
        ...TaskList_projectRevision
      }
      ...ProjectManagerFormGroup_query
    }
  }
`;

export function ProjectRevision({
  preloadedQuery,
}: RelayProps<{}, managersFormQuery>) {
  const projectManagerFormRef = useRef<ISupportExternalValidation>(null);

  const { query } = usePreloadedQuery(pageQuery, preloadedQuery);

  const lastEditedDate = useMemo(
    () => new Date(query.projectRevision.updatedAt),
    [query.projectRevision.updatedAt]
  );

  if (!query.projectRevision.id) return null;

  /**
   *  Stage the project manager form_changes
   */
  const handleSubmit = async () => {
    const errors = [...projectManagerFormRef.current.selfValidate()];

    if (errors.length > 0) {
      console.log("Could not submit a form with errors: ", errors);
      return;
    }

    // TODO
  };

  const taskList = <TaskList projectRevision={query.projectRevision} />;

  return (
    <DefaultLayout session={query.session} leftSideNav={taskList}>
      <header>
        <h2>Project Managers</h2>
        <SavingIndicator isSaved={true} lastEdited={lastEditedDate} />
      </header>

      <ProjectManagerFormGroup
        query={query}
        revision={query.projectRevision}
        projectManagerFormRef={projectManagerFormRef}
        setValidatingForm={(validator) =>
          (projectManagerFormRef.current = validator)
        }
      />

      <Button size="medium" variant="primary" onClick={handleSubmit}>
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
