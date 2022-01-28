import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import EmptyObjectFieldTemplate from "lib/theme/EmptyObjectFieldTemplate";
import { useMemo } from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import { ProjectContactForm_query$key } from "__generated__/ProjectContactForm_query.graphql";
import FormBase from "./FormBase";
import FormComponentProps from "./FormComponentProps";
import Grid from "@button-inc/bcgov-theme/Grid";
import FormBorder from "lib/theme/components/FormBorder";
import { Button } from "@button-inc/bcgov-theme";
import { mutation as addContactToRevisionMutation } from "mutations/Contact/addContactToRevision";

interface Props extends FormComponentProps {
  query: ProjectContactForm_query$key;
}

const uiSchema = {
  "ui:title": "Primary Contact",
  cifUserId: {
    "ui:placeholder": "Select a Contact",
    "ui:col-md": 12,
    "bcgov:size": "small",
    "ui:widget": "SearchWidget",
  },
};

const ProjectContactForm: React.FC<Props> = (props) => {
  const { query } = useFragment(
    graphql`
      fragment ProjectContactForm_query on Query {
        query {
          projectRevision(id: $projectRevision) {
            rowId
            formChangesByProjectRevisionId(
              filter: { formDataTableName: { equalTo: "project_contact" } }
              first: 2147483647
            ) @connection(key: "connection_formChangesByProjectRevisionId") {
              __id
              edges {
                node {
                  id
                  newFormData
                }
              }
            }
          }
          allContacts {
            edges {
              node {
                rowId
                fullName
              }
            }
          }
        }
      }
    `,
    props.query
  );

  const availableContacts = useMemo(() => {
    return query.allContacts.edges.map(({ node }) => {
      return {
        type: "number",
        title: node.fullName,
        enum: [node.rowId],
        value: node.rowId,
      } as JSONSchema7Definition;
    });
  }, [query]);

  const schema: JSONSchema7 = {
    type: "object",
    required: ["cifUserId"],
    properties: {
      cifUserId: {
        title: "Primary Contact",
        type: "number",
        default: undefined,
        anyOf: availableContacts,
      },
    },
  };

  const [addContactMutation, isAddingContact] = useMutation(
    addContactToRevisionMutation
  );

  const addContact = (contactIndex: number) => {
    addContactMutation({
      variables: {
        input: {
          revisionId: query.projectRevision.rowId,
          contactIndex: contactIndex,
        },
        connections: [
          query.projectRevision.formChangesByProjectRevisionId.__id,
        ],
      },
    });
  };

  return (
    <Grid cols={10}>
      <Grid.Row>
        <Grid.Col span={10}>
          <FormBorder title="Project Contacts">
            <Grid.Row>
              <Grid.Col span={7}>
                {query.projectRevision.formChangesByProjectRevisionId.edges.map(
                  (edge) => (
                    <span key={edge.node.id}>
                      {JSON.stringify(edge.node.newFormData)}
                    </span>
                  )
                )}
                <label>Contacts for current status</label>
              </Grid.Col>
              <Grid.Col span={3}>
                <Button style={{ marginRight: "auto" }}>
                  View Contact List
                </Button>
              </Grid.Col>
            </Grid.Row>
            <Grid.Row>
              <Grid.Col span={10}>
                <FormBase
                  {...props}
                  schema={schema}
                  uiSchema={uiSchema}
                  ObjectFieldTemplate={EmptyObjectFieldTemplate}
                />
              </Grid.Col>
            </Grid.Row>
            <Grid.Row>
              <label>Secondary Contacts</label>
            </Grid.Row>
            <Grid.Row>
              <Grid.Col span={7}>
                <FormBase
                  {...props}
                  schema={schema}
                  uiSchema={uiSchema}
                  ObjectFieldTemplate={EmptyObjectFieldTemplate}
                />
              </Grid.Col>
              <Grid.Col span={2}>
                <br />
                <Button
                  style={{ marginRight: "auto" }}
                  size="large"
                  disabled={isAddingContact}
                  onClick={() =>
                    addContact(
                      Math.max(
                        ...query.projectRevision.formChangesByProjectRevisionId.edges.map(
                          ({ node }) => node.newFormData.contactIndex
                        )
                      ) + 1
                    )
                  }
                >
                  Add
                </Button>
              </Grid.Col>
            </Grid.Row>
          </FormBorder>
        </Grid.Col>
      </Grid.Row>
    </Grid>
  );
};

export default ProjectContactForm;
