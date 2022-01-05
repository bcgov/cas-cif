import { ADMIN_ROLES } from "data/group-constants";
import { useCallback, useMemo } from "react";
import Link from "next/link";
import BCGovLink from "@button-inc/bcgov-theme/Link";
import { useFragment, graphql, useMutation } from "react-relay";
import { Dashboard_query$key } from "__generated__/Dashboard_query.graphql";
import {
  getContactsPageRoute,
  getOperatorsPageRoute,
  getProjectRevisionPageRoute,
  getProjectsPageRoute,
} from "pageRoutes";
import { mutation as createProjectMutation } from "mutations/Project/createProject";
import { createProjectMutationResponse } from "__generated__/createProjectMutation.graphql";
import { useRouter } from "next/router";

interface Props {
  query: Dashboard_query$key;
}

const Dashboard: React.FC<Props> = ({ query: queryKey }) => {
  const router = useRouter();
  const { session, pendingNewProjectRevision } = useFragment(
    graphql`
      fragment Dashboard_query on Query {
        session {
          cifUserBySub {
            firstName
          }
          userGroups
        }
        pendingNewProjectRevision {
          id
        }
      }
    `,
    queryKey
  );

  const [createProject, isProjectCreating] = useMutation(createProjectMutation);

  const handleProjectCreation = useCallback(() => {
    if (isProjectCreating) return;
    createProject({
      variables: { input: {} },
      onCompleted: (response: createProjectMutationResponse) => {
        router.push(
          getProjectRevisionPageRoute(response.createProject.projectRevision.id)
        );
      },
    });
  }, [createProject, isProjectCreating, router]);

  const isAdmin = useMemo(
    () => ADMIN_ROLES.some((role) => session?.userGroups?.includes(role)),
    [session?.userGroups]
  );

  const addOrResumeProjectLink = useMemo(
    () =>
      pendingNewProjectRevision ? (
        <Link
          passHref
          href={getProjectRevisionPageRoute(pendingNewProjectRevision.id)}
        >
          <BCGovLink>Resume Project Draft</BCGovLink>
        </Link>
      ) : (
        <button onClick={handleProjectCreation} disabled={isProjectCreating}>
          Create a new Project
        </button>
      ),
    [pendingNewProjectRevision, handleProjectCreation, isProjectCreating]
  );

  return (
    <>
      <header>
        <h2>Welcome, {session.cifUserBySub?.firstName}</h2>
      </header>
      <main>
        <section>
          <header>
            <h3>Projects</h3>
          </header>
          <main>
            <Link passHref href={getProjectsPageRoute()}>
              <BCGovLink>Projects List</BCGovLink>
            </Link>
            {addOrResumeProjectLink}
          </main>
        </section>
        <section>
          <header>
            <h3>Reporting Operations</h3>
          </header>
          <main>
            <Link passHref href={getOperatorsPageRoute()}>
              <BCGovLink>Operators</BCGovLink>
            </Link>
            <Link passHref href={getContactsPageRoute()}>
              <BCGovLink>Contacts</BCGovLink>
            </Link>
          </main>
        </section>
        {isAdmin && (
          <section>
            <header>
              <h3>Administration</h3>
            </header>
            <main></main>
          </section>
        )}
      </main>
      <style jsx>{`
        main {
          display: flex;
          flex-wrap: wrap;
        }

        section {
          width: 18rem;
          margin: 1rem;
          border: 1px solid #939393;
          border-radius: 4px;
        }

        section > header {
          min-height: 5rem;
        }

        :global(section > main > *),
        section > header {
          padding: 0.75rem 1.25rem;
        }

        section > main {
          flex-direction: column;
        }

        :global(section > main > *:not(:last-child)),
        section > header {
          border-bottom: 1px solid #939393;
        }

        :global(button) {
          color: #1a5a96;
          background: transparent;
          border: none;
          cursor: pointer;
          text-decoration: underline;
          text-align: left;
        }
        :global(button:hover) {
          text-decoration: none;
          color: blue;
        }
      `}</style>
    </>
  );
};

export default Dashboard;
