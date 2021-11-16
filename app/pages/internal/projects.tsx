import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { projectsQuery } from "__generated__/projectsQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import { useState } from "react";
import Button from "@button-inc/bcgov-theme/Button";
import Input from "@button-inc/bcgov-theme/Input";
import Grid from "@button-inc/bcgov-theme/Grid";
import Card from "@button-inc/bcgov-theme/Card";
import commitProjectMutation from "mutations/Project/createProject";
import updateFormChangeMutation from "mutations/FormChange/updateFormChange";

const ProjectsQuery = graphql`
  query projectsQuery {
    query {
      session {
        ...DefaultLayout_session
      }
      allProjects {
        edges {
          node {
            id
            cifIdentifier
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

function Projects({ preloadedQuery }: RelayProps<{}, projectsQuery>) {
  const { query } = usePreloadedQuery(ProjectsQuery, preloadedQuery);
  const [identifier, setIdentifier] = useState("");
  const [description, setDescription] = useState("");
  const stageProject = async () => {
    await commitProjectMutation(preloadedQuery.environment, {
      project: {
        cifIdentifier: Number(identifier),
        description: description,
      },
    });
    setIdentifier("");
    setDescription("");
  };

  const approveStagedProject = async (id: string) => {
    console.log(id);
    console.log("HECK YES! APPROVED!");
    await updateFormChangeMutation(preloadedQuery.environment, {
      id: id,
      formChangePatch: { changeStatus: "saved" },
    });
  };

  const rejectStagedProject = async (id: string) => {
    console.log(id);
    console.log("REEEEJECTED!");
    // await updateFormChangeMutation(preloadedQuery.environment, { id: id, formChangePatch: {changeStatus: 'rejected'} } );
  };

  return (
    <DefaultLayout session={query.session} title="CIF Projects Management">
      <Grid.Row>
        <Grid.Col span={2}>
          <p>
            <em>Project Identifier</em>
          </p>
        </Grid.Col>
        <Grid.Col span={4}>
          <Input
            name="project-identifier"
            value={identifier}
            onInput={(e) => setIdentifier(e.target.value)}
          />
        </Grid.Col>
      </Grid.Row>
      <Grid.Row>
        <Grid.Col span={2}>
          <p>
            <em>Project Description</em>
          </p>
        </Grid.Col>
        <Grid.Col span={4}>
          <Input
            name="project-description"
            value={description}
            onInput={(e) => setDescription(e.target.value)}
          />
        </Grid.Col>
      </Grid.Row>
      <Grid.Row>
        <Grid.Col span={3}>
          <Button name="create-project" onClick={stageProject}>
            Create Project
          </Button>
        </Grid.Col>
      </Grid.Row>
      <br />
      <hr />
      <h1>Projects</h1>
      {query.allProjects.edges.length === 0 && <p>None</p>}
      {query.allProjects.edges.map(({ node }) => (
        <Card title={node.cifIdentifier} key={node.id}>
          <p>{node.description}</p>
        </Card>
      ))}
      <h1>Pending Projects</h1>
      {query.allFormChanges.edges.length === 0 && <p>None</p>}
      {query.allFormChanges.edges.map(({ node }) => {
        const cardTitle = `${node.newFormData.cif_identifier} (${node.changeStatus})`;
        return (
          <Card title={cardTitle} key={node.id}>
            <p>Description: {node.newFormData.description}</p>
            <p>Reason: {node.changeReason}</p>
            <Grid.Row>
              <Grid.Col span={3}>
                <Button onClick={() => approveStagedProject(node.id)}>
                  Approve
                </Button>
              </Grid.Col>
              <Grid.Col span={3}>
                <Button onClick={() => rejectStagedProject(node.id)}>
                  Reject
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
