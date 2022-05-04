import { Button } from "@button-inc/bcgov-theme";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import Grid from "@button-inc/bcgov-theme/Grid";
import FormBorder from "lib/theme/components/FormBorder";
import quarterlyReports from "pages/cif/project-revision/[projectRevision]/form/quarterly-reports";
import { useMemo, useRef } from "react";
import { graphql, useFragment } from "react-relay";
import quarterlyReportSchema from "data/jsonSchemaForm/quarterlyReportSchema";
import { ProjectQuarterlyReportsForm_projectRevision$key } from "__generated__/ProjectQuarterlyReportsForm_projectRevision.graphql";
import { ProjectQuarterlyReportsForm_query$key } from "__generated__/ProjectQuarterlyReportsForm_query.graphql";
import SavingIndicator from "./SavingIndicator";
import { useUpdateProjectContactFormChange } from "mutations/ProjectContact/updateProjectContactFormChange";
import useDiscardFormChange from "hooks/useDiscardFormChange";

interface Props {
  query: ProjectQuarterlyReportsForm_query$key;
  onSubmit: () => void;
  projectRevision: ProjectQuarterlyReportsForm_projectRevision$key;
}

const uiSchema = {
  quarterlyReportId: {
    "ui:col-md": 12,
    "bcgov:size": "small",
  },
  dueDate: {
    "ui:col-md": 12,
    "bcgov:size": "small",
  },

  submittedDate: {
    "ui:col-md": 12,
    "bcgov:size": "small",
  },
  comments: {
    "ui:col-md": 12,
    "bcgov:size": "small",
  },
};
export const createProjectQuarterlyReportsSchema = (
  allReportingRequirements
) => {
  const schema = quarterlyReportSchema;
  //brianna --is id the correct thing to be checking here?
  schema.properties.quarterlyReportId = {
    ...schema.properties.quarterlyReportId,
    anyOf: allReportingRequirements.edges.map(({ node }) => {
      return {
        type: "number",
        title: node.reportTypeByReportType.name,
        enum: [node.rowId],
        value: node.rowId,
      } as JSONSchema7Definition;
    }),
  };

  return schema as JSONSchema7;
};

const ProjectQuarterlyReportsForm: React.FC<Props> = (props) => {
  const formRefs = useRef({});

  //   brianna - currently the contactformchanges query, fix
  const projectRevision = useFragment(
    graphql`
      fragment ProjectQuarterlyReportsForm_projectRevision on ProjectRevision {
        id
        rowId
        projectContactFormChanges(first: 500)
          @connection(key: "connection_projectContactFormChanges") {
          __id
          edges {
            node {
              id
              newFormData
              operation
              changeStatus
              formChangeByPreviousFormChangeId {
                changeStatus
                newFormData
              }
            }
          }
        }
      }
    `,
    props.projectRevision
  );

  const { allReportingRequirements } = useFragment(
    graphql`
      fragment ProjectQuarterlyReportsForm_query on Query {
        allReportingRequirements {
          edges {
            node {
              id
              reportType
              submittedDate
              comments
              reportDueDate
              reportTypeByReportType {
                name
              }
            }
          }
        }
      }
    `,
    props.query
  );

  const quarterlyReportsSchema = useMemo(() => {
    return createProjectQuarterlyReportsSchema(allReportingRequirements);
  }, [allReportingRequirements]);

  //brianna --do we need an all forms like ProjectContactForm? It needs primary/secondary

  ///////////mutations to-do:
  //   const [addQuarterlyReportMutation, isAdding] =
  //     useAddQuarterlyReportToRevision();

  //   const [applyUpdateFormChangeMutation, isUpdating] =
  //     useUpdateQuarterlyReportFormChange();

  //   const [discardFormChange] = useDiscardFormChange(
  //     projectQuarterlyReportsFormChanges.__id
  //   );

  ////////onclick functions - add, delete, update, stage

  return (
    <div>
      <header>
        <h2>Project Quarterly Reports</h2>

        {/* <SavingIndicator isSaved={!isUpdating && !isAdding} /> */}
      </header>

      <Grid cols={10} align="center">
        <Grid.Row>
          <Grid.Col span={10}>
            <FormBorder>
              <label>Quarterly Reports</label>
              {/* {alternateContactForms.map((form) => {
                  return (
                    <Grid.Row key={form.id}>
                      <Grid.Col span={6}>
                        <FormBase
                          id={`form-${form.id}`}
                          idPrefix={`form-${form.id}`}
                          ref={(el) => (formRefs.current[form.id] = el)}
                          formData={form.newFormData}
                          onChange={(change) => {
                            updateFormChange(
                              { ...form, changeStatus: "pending" },
                              change.formData
                            );
                          }}
                          schema={contactSchema}
                          uiSchema={uiSchema}
                          ObjectFieldTemplate={EmptyObjectFieldTemplate}
                        />
                      </Grid.Col>
                      <Grid.Col span={4}>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => deleteContact(form.id, form.operation)}
                        >
                          Remove
                        </Button>
                      </Grid.Col>
                    </Grid.Row>
                  );
                })} */}
              {/* <Grid.Row>
                  <Grid.Col span={10}>
                    <Button
                      style={{ marginRight: "auto" }}
                      onClick={() =>
                        // allForms is already sorted by contactIndex
                        addContact(
                          allForms[allForms.length - 1].newFormData.contactIndex +
                            1
                        )
                      }
                    >
                      Add
                    </Button>
                  </Grid.Col>
                </Grid.Row> */}

              <Grid.Row>
                <Button
                  size="medium"
                  variant="primary"
                  // onClick={stageContactFormChanges}
                  //   disabled={isUpdating}
                >
                  Submit Quarterly Reports
                </Button>
              </Grid.Row>
            </FormBorder>
          </Grid.Col>
        </Grid.Row>
      </Grid>
      <style jsx>{`
        div :global(button.pg-button) {
          margin-left: 0.4em;
          margin-right: 0em;
        }
        div :global(.right-aligned-column) {
          display: flex;
          justify-content: flex-end;
          align-items: flex-start;
        }
      `}</style>
    </div>
  );
};

export default ProjectQuarterlyReportsForm;
