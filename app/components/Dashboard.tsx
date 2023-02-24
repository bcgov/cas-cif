import useIsAdmin from "hooks/useIsAdmin";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import { getMetabaseRoute, getSupportEmailMailTo } from "routes/externalRoutes";
import {
  getContactsPageRoute,
  getNewProjectRevisionPageRoute,
  getOperatorsPageRoute,
  getProjectRevisionFormPageRoute,
  getProjectsPageRoute,
} from "routes/pageRoutes";
import { Dashboard_query$key } from "__generated__/Dashboard_query.graphql";
import BCGovLink from "./BCGovLink";

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
            givenName
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

  const isAdmin = useIsAdmin(session?.userGroups);

  const addOrResumeProjectLink = useMemo(
    () =>
      pendingNewProjectRevision ? (
        <BCGovLink
          passHref
          href={getProjectRevisionFormPageRoute(
            pendingNewProjectRevision.id,
            0
          )}
        >
          Resume Project Draft
        </BCGovLink>
      ) : (
        <button onClick={() => router.push(getNewProjectRevisionPageRoute())}>
          Create a new Project
        </button>
      ),
    [pendingNewProjectRevision, router]
  );

  return (
    <>
      <header>
        <h2>Welcome, {session.cifUserBySub?.givenName}</h2>
      </header>
      <div>
        <section>
          <div id="projects-heading">
            <h3>Projects</h3>
            <small>Create, view and manage projects</small>
          </div>
          <nav aria-labelledby="projects-heading">
            <BCGovLink passHref href={getProjectsPageRoute()}>
              Projects List
            </BCGovLink>
            {addOrResumeProjectLink}
          </nav>
        </section>
        <section>
          <div id="reporting-op-heading">
            <h3>Reporting Operations</h3>
            <small>Create, manage and search</small>
          </div>
          <nav aria-labelledby="reporting-op-heading">
            <BCGovLink passHref href={getOperatorsPageRoute()}>
              Operators
            </BCGovLink>
            <BCGovLink passHref href={getContactsPageRoute()}>
              Contacts
            </BCGovLink>
          </nav>
        </section>
        {isAdmin && (
          <section>
            <div id="admin-heading">
              <h3>Administration</h3>
            </div>
            <nav aria-labelledby="admin-heading">
              <BCGovLink passHref href={getMetabaseRoute()} target="_blank">
                Data Insights (Metabase)
              </BCGovLink>
              <BCGovLink
                passHref
                href={
                  getSupportEmailMailTo("CIF App: Report a problem!").pathname
                }
                target="_blank"
              >
                Report a Problem
              </BCGovLink>
            </nav>
          </section>
        )}
      </div>
      <style jsx>{`
        div,
        nav {
          display: flex;
          flex-wrap: wrap;
        }

        section {
          width: 18rem;
          margin: 1rem;
          border: 1px solid #939393;
          border-radius: 4px;
        }

        section > div {
          min-height: 5.2rem;
        }

        :global(section > nav > *),
        section > div {
          padding: 0.75rem 1.25rem;
        }

        section > nav {
          flex-direction: column;
        }

        :global(section > nav > *:not(:last-child)),
        section > div {
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
