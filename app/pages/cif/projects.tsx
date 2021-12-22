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
    query {
      session {
        ...DefaultLayout_session
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
      allProjectRevisions(filter: { changeStatus: { equalTo: "pending" } }) {
        edges {
          node {
            id
            changeStatus
            formChangesByProjectRevisionId {
              edges {
                node {
                  id
                  newFormData
                  changeStatus
                  changeReason
                }
              }
            }
          }
        }
      }
    }
  }
`;

export function Projects({ preloadedQuery }: RelayProps<{}, projectsQuery>) {
  const router = useRouter();
  const { query } = usePreloadedQuery(ProjectsQuery, preloadedQuery);
  const createDraftProject = async () => {
    const response = await commitProjectMutation(preloadedQuery.environment, {
      input: {},
    });
    await router.push(
      getProjectRevisionPageRoute(response.createProject.projectRevision.id)
    );
  };

  const resumeStagedProject = async (id: string) => {
    await router.push(getProjectRevisionPageRoute(id));
  };

  return (
    <DefaultLayout session={query.session} title="CIF Projects Management">
      <Grid>
        <Grid.Row>
          <Grid.Col span={4}>
            <Button
              role="button"
              name="create-project"
              onClick={createDraftProject}
            >
              + Create Project
            </Button>
          </Grid.Col>
        </Grid.Row>
        <br />
        <hr />
        <h1>Projects</h1>
        {query.allProjects.edges.length === 0 && <p>None</p>}
        {query.allProjects.edges.map(({ node }) => (
          <Card title={node.rfpNumber} key={node.id}>
            <p>{node.description}</p>
          </Card>
        ))}
        <h1>Pending Projects</h1>
        {query.allProjectRevisions.edges.length === 0 && <p>None</p>}
        {query.allProjectRevisions.edges.map(({ node }) => {
          const projectChangeNode =
            node.formChangesByProjectRevisionId.edges[0].node;
          const cardTitle = `${projectChangeNode.newFormData.rfpNumber} (${projectChangeNode.changeStatus})`;
          return (
            <Card title={cardTitle} key={node.id}>
              <p>Description: {projectChangeNode.newFormData.description}</p>
              <p>Reason: {projectChangeNode.changeReason}</p>
              <Grid.Row>
                <Grid.Col span={3}>
                  <Button onClick={() => resumeStagedProject(node.id)}>
                    Resume
                  </Button>
                </Grid.Col>
              </Grid.Row>
            </Card>
          );
        })}
      </Grid>
    </DefaultLayout>
  );
}

export default withRelay(Projects, ProjectsQuery, withRelayOptions);
