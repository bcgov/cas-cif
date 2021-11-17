import DefaultLayout from "components/Layout/DefaultLayout";
import { withRelay, RelayProps } from "relay-nextjs";
import { graphql, usePreloadedQuery } from "react-relay/hooks";
import { projectsQuery } from "__generated__/projectsQuery.graphql";
import withRelayOptions from "lib/relay/withRelayOptions";
import { useState } from "react";
// import Card from "@button-inc/bcgov-theme/Card";
// import commitProjectMutation from "mutations/Project/createProject";
// import updateFormChangeMutation from "mutations/FormChange/updateFormChange";
import Form from "lib/theme/service-development-toolkit-form";
import { JSONSchema7 } from "json-schema";

const CreateProjectQuery = graphql`
  query createProjectQuery {
    query {
      session {
        ...DefaultLayout_session
      }
    }
  }
`;

const projectSchema: JSONSchema7 = {
  title: "Project",
  type: "object",
  properties: {
    cifIdentifier: {
      type: "number",
    },
    description: {
      type: "string",
    },
  },
};

function CreateProject({ preloadedQuery }: RelayProps<{}, projectsQuery>) {
  const { query } = usePreloadedQuery(CreateProjectQuery, preloadedQuery);
  const [identifier, setIdentifier] = useState("");
  const [description, setDescription] = useState("");
  // const stageProject = async () => {
  //   await commitProjectMutation(preloadedQuery.environment, {
  //     project: {
  //       cifIdentifier: Number(identifier),
  //       description: description,
  //     },
  //   });
  //   setIdentifier("");
  //   setDescription("");
  // };

  // const approveStagedProject = async (id: string) => {
  //   console.log(id);
  //   console.log("HECK YES! APPROVED!");
  //   await updateFormChangeMutation(preloadedQuery.environment, {
  //     id: id,
  //     formChangePatch: { changeStatus: "saved" },
  //   });
  // };

  // const rejectStagedProject = async (id: string) => {
  //   console.log(id);
  //   console.log("REEEEJECTED!");
  //   // await updateFormChangeMutation(preloadedQuery.environment, { id: id, formChangePatch: {changeStatus: 'rejected'} } );
  // };

  return (
    <Form
      schema={projectSchema}
      onChange={(change) => {
        console.log(change);
      }}
    />
    // <DefaultLayout session={query.session} title="CIF Projects Management">
    //   <Grid.Row>
    //     <Grid.Col span={2}>
    //       <p>
    //         <em>Project Identifier</em>
    //       </p>
    //     </Grid.Col>
    //     <Grid.Col span={4}>
    //       <Input
    //         name="project-identifier"
    //         value={identifier}
    //         onInput={(e) => setIdentifier(e.target.value)}
    //       />
    //     </Grid.Col>
    //   </Grid.Row>
    //   <Grid.Row>
    //     <Grid.Col span={2}>
    //       <p>
    //         <em>Project Description</em>
    //       </p>
    //     </Grid.Col>
    //     <Grid.Col span={4}>
    //       <Input
    //         name="project-description"
    //         value={description}
    //         onInput={(e) => setDescription(e.target.value)}
    //       />
    //     </Grid.Col>
    //   </Grid.Row>
    //   <Grid.Row>
    //     <Grid.Col span={3}>
    //       <Button name="create-project" onClick={stageProject}>
    //         Create Project
    //       </Button>
    //     </Grid.Col>
    //   </Grid.Row>
    // </DefaultLayout>
  );
}

export default withRelay(CreateProject, CreateProjectQuery, withRelayOptions);
