import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { projectsQuery } from "__generated__/projectsQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import Button from "@button-inc/bcgov-theme/Button";
import Grid from "@button-inc/bcgov-theme/Grid";
import Card from "@button-inc/bcgov-theme/Card";
import commitProjectMutation from "mutations/Project/createProject";
import { useRouter } from "next/router";
import { getProjectRevisionPageRoute } from "pageRoutes";

export const ProjectsQuery = graphql`
  query projectsQuery {
    session {
      ...DefaultLayout_session
    }

    pendingNewProjectRevision {
      id
    }

    allProjects {
      edges {
        node {
          id
          rfpNumber
          description
        }
      }
    }
  }
`;

export function Projects({ preloadedQuery }: RelayProps<{}, projectsQuery>) {
  const router = useRouter();
  const { allProjects, pendingNewProjectRevision, session } = usePreloadedQuery(
    ProjectsQuery,
    preloadedQuery
  );
  const createDraftProject = async () => {
    const response = await commitProjectMutation(preloadedQuery.environment, {
      input: {},
    });
    await router.push(
      getProjectRevisionPageRoute(response.createProject.projectRevision.id)
    );
  };

  const resumeStagedProject = async () => {
    await router.push(
      getProjectRevisionPageRoute(pendingNewProjectRevision.id)
    );
  };

  const createOrResumeButton = pendingNewProjectRevision ? (
    <Button role="button" onClick={resumeStagedProject}>
      Resume Project Draft
    </Button>
  ) : (
    <Button role="button" onClick={createDraftProject}>
      Add a Project
    </Button>
  );

  return (
    <DefaultLayout session={session}>
      <header>
        <h2>CIF Projects</h2>
        <section>
          <p>Please note: there is a maximum of one draft project at a time.</p>
          {createOrResumeButton}
        </section>
      </header>
      <Grid>
        <h3>Projects (temporary view)</h3>
        {allProjects.edges.length === 0 && <p>None</p>}
        {allProjects.edges.map(({ node }) => (
          <Card title={node.rfpNumber} key={node.id}>
            <p>{node.description}</p>
          </Card>
        ))}
      </Grid>
      <style jsx>{`
        header > section {
          display: flex;
          justify-content: space-between;
        }
      `}</style>
    </DefaultLayout>
  );
}

export default withRelay(Projects, ProjectsQuery, withRelayOptions);
