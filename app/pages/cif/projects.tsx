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
      allFormChanges(filter: { changeStatus: { equalTo: "pending" } }) {
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
`;

export function Projects({ preloadedQuery }: RelayProps<{}, projectsQuery>) {
  const router = useRouter();
  const { query } = usePreloadedQuery(ProjectsQuery, preloadedQuery);
  const createDraftProject = async () => {
    const response = await commitProjectMutation(preloadedQuery.environment, {
      input: {},
    });
    await router.push({
      pathname: "/cif/create-project",
      query: {
        id: response.createProject.formChange.id,
      },
    });
  };

  const resumeStagedProject = async (id: string) => {
    await router.push({
      pathname: "/cif/create-project",
      query: {
        id: id,
      },
    });
  };

  return (
    <DefaultLayout session={query.session} title="CIF Projects Management">
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
      {query.allFormChanges.edges.length === 0 && <p>None</p>}
      {query.allFormChanges.edges.map(({ node }) => {
        const cardTitle = `${node.newFormData.rfpNumber} (${node.changeStatus})`;
        return (
          <Card title={cardTitle} key={node.id}>
            <p>Description: {node.newFormData.description}</p>
            <p>Reason: {node.changeReason}</p>
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
    </DefaultLayout>
  );
}

export default withRelay(Projects, ProjectsQuery, withRelayOptions);
