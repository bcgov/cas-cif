import "@testing-library/jest-dom";
import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectRevision } from "pages/cif/project-revision/[projectRevision]";
import PageTestingHelper from "tests/helpers/pageTestingHelper";
import compiledProjectRevisionQuery, {
  ProjectRevisionQuery,
} from "__generated__/ProjectRevisionQuery.graphql";
import reportingRequirementProdSchema from "../../../../../../schema/data/prod/json_schema/reporting_requirement.json";
import projectContactProdSchema from "../../../../../../schema/data/prod/json_schema/project_contact.json";
import projectManagerProdSchema from "../../../../../../schema/data/prod/json_schema/project_manager.json";
/***
 * https://relay.dev/docs/next/guides/testing-relay-with-preloaded-queries/#configure-the-query-resolver-to-generate-the-response
 * To find the key of the generated operation, one can call
 * `console.log(JSON.stringify(operation, null, 2))`
 * just before returning the MockPayloadGenerator and looking for concreteType instances *
 */

const defaultMockResolver = {
  Form() {
    return {
      jsonSchema: reportingRequirementProdSchema,
    };
  },
  ProjectRevision() {
    return {
      id: "mock-proj-rev-id",
      rowId: 123456,
      projectByProjectId: {
        proposalReference: null,
      },
      projectFormChange: {
        id: "mock-project-form-id",
        newFormData: {
          someProjectData: "test2",
        },
      },
      summaryMilestoneReportingRequirementFormChanges: {
        edges: [],
      },
      summaryMilestoneFormChanges: {
        edges: [],
      },
      summaryMilestonePaymentFormChanges: {
        edges: [],
      },
    };
  },
};

const pageTestingHelper = new PageTestingHelper<ProjectRevisionQuery>({
  pageComponent: ProjectRevision,
  compiledQuery: compiledProjectRevisionQuery,
  defaultQueryResolver: defaultMockResolver,
  defaultQueryVariables: {
    projectRevision: "mock-id",
  },
});

describe("The Create Project page", () => {
  beforeEach(() => {
    pageTestingHelper.reinit();
    jest.restoreAllMocks();
  });

  it("renders the task list in the left navigation with correct highlighting", () => {
    const mockPathname = "/cif/project-revision/[projectRevision]";
    pageTestingHelper.setMockRouterValues({
      pathname: mockPathname,
    });

    pageTestingHelper.loadQuery({
      Form() {
        return {
          jsonSchema: reportingRequirementProdSchema,
        };
      },
      ProjectRevision() {
        return {
          id: "mock-id",
          projectId: null,
          summaryMilestoneReportingRequirementFormChanges: {
            edges: [],
          },
          summaryMilestoneFormChanges: {
            edges: [],
          },
          summaryMilestonePaymentFormChanges: {
            edges: [],
          },
          summaryProjectAttachmentFormChanges: {
            edges: [],
          },
        };
      },
    });
    pageTestingHelper.renderPage();

    expect(
      within(
        screen.getByRole("navigation", { name: "side navigation" })
      ).getByText(/Add a Project/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Review and Submit information/i).closest("li")
    ).toHaveAttribute("aria-current", "step");
  });

  it("Renders an enabled submit and discard project revision button", async () => {
    jest
      .spyOn(require("mutations/useDebouncedMutation"), "default")
      .mockImplementation(() => [jest.fn(), false]);
    const mockResolver = {
      ...defaultMockResolver,
      FormChange() {
        return {
          validationErrors: [],
        };
      },
    };
    pageTestingHelper.loadQuery(mockResolver);
    pageTestingHelper.renderPage();
    expect(screen.getByText("Submit")).not.toBeDisabled();
    expect(screen.getByText("Discard Project Revision")).toHaveProperty(
      "disabled",
      false
    );
  });

  it("Renders an empty summary before the form has been filled out", async () => {
    pageTestingHelper.loadQuery({
      Form() {
        return {
          jsonSchema: reportingRequirementProdSchema,
        };
      },
      ProjectRevision() {
        return {
          id: "mock-proj-rev-id",
          projectFormChange: { newFormData: {} },
          summaryMilestoneReportingRequirementFormChanges: {
            edges: [],
          },
          summaryMilestoneFormChanges: {
            edges: [],
          },
          summaryMilestonePaymentFormChanges: {
            edges: [],
          },
        };
      },
    });
    pageTestingHelper.renderPage();

    expect(screen.getByText(/Project Overview not added/i)).toBeInTheDocument();
    expect(screen.getByText(/Project Managers not added/i)).toBeInTheDocument();
    expect(screen.getByText(/Project Contacts not added/i)).toBeInTheDocument();
  });

  it("Renders the summary with the filled-out details", async () => {
    pageTestingHelper.loadQuery({
      Form(context) {
        // If the form is the project manager form, return the project manager schema
        if (
          context.name === "formByJsonSchemaName" &&
          context.path[2] == "projectManagerFormChangesByLabel"
        ) {
          return {
            jsonSchema: projectManagerProdSchema,
          };
        }
        // If the form is the project contact form, return the project contact schema
        if (
          context.name === "formByJsonSchemaName" &&
          context.path[2] == "summaryContactFormChanges"
        ) {
          return {
            jsonSchema: projectContactProdSchema,
          };
        }
        // Handle default case
        return {
          jsonSchema: {
            schema: {
              $schema: "http://json-schema.org/draft-07/schema",
              type: "object",
              title: null,
              properties: {},
            },
          },
        };
      },
      ProjectRevision() {
        return {
          id: "Test Project Revision ID",
          isFirstRevision: true,
          projectFormChange: {
            id: "mock-project-form-id",
            isPristine: false,
            newFormData: {
              summary: "test-summary",
              operatorId: 3,
              projectName: "test-project-name",
              projectStatusId: 1,
              proposalReference: "test-prop-reference",
              fundingStreamRfpId: 1,
              totalFundingRequest: 5,
            },
            asProject: {
              operatorByOperatorId: {
                legalName: "test-legal-name",
                bcRegistryId: "test-bc-registry-id",
              },
              fundingStreamRfpByFundingStreamRfpId: {
                year: 2020,
                fundingStreamByFundingStreamId: {
                  description: "test-funding-stream-description",
                },
              },
              projectStatusByProjectStatusId: {
                name: "test-project-status-name",
              },
            },
          },
          summaryMilestoneReportingRequirementFormChanges: {
            edges: [],
          },
          summaryMilestoneFormChanges: {
            edges: [],
          },
          summaryMilestonePaymentFormChanges: {
            edges: [],
          },
          projectManagerFormChangesByLabel: {
            edges: [
              {
                node: {
                  formChange: {
                    isPristine: false,
                    newFormData: {
                      cifUserId: 4,
                      projectId: 2,
                      projectManagerLabelId: 1,
                    },
                    asProjectManager: {
                      cifUserByCifUserId: {
                        fullName: "test manager one",
                      },
                    },
                    operation: "CREATE",
                  },
                  projectManagerLabel: {
                    label: "Tech Team Primary",
                  },
                },
              },
              {
                node: {
                  formChange: {
                    isPristine: false,
                    newFormData: {
                      cifUserId: 5,
                      projectId: 2,
                      projectManagerLabelId: 2,
                    },
                    asProjectManager: {
                      cifUserByCifUserId: {
                        fullName: "test manager two",
                      },
                    },
                    operation: "CREATE",
                  },
                  projectManagerLabel: {
                    label: "Tech Team Secondary",
                  },
                },
              },
              {
                node: {
                  formChange: {
                    isPristine: false,
                    newFormData: {
                      cifUserId: 6,
                      projectId: 2,
                      projectManagerLabelId: 3,
                    },
                    asProjectManager: {
                      cifUserByCifUserId: {
                        fullName: "test manager three",
                      },
                    },
                    operation: "CREATE",
                  },
                  projectManagerLabel: {
                    label: "Ops Team Primary",
                  },
                },
              },
              {
                node: {
                  formChange: null,
                  projectManagerLabel: {
                    label: "Ops Team Secondary",
                  },
                },
              },
            ],
          },
          summaryContactFormChanges: {
            edges: [
              {
                node: {
                  isPristine: false,
                  newFormData: {
                    contactId: 2,
                    projectId: 2,
                    contactIndex: 2,
                  },
                  asProjectContact: {
                    contactByContactId: {
                      fullName: "test secondary contact",
                    },
                  },
                },
              },
              {
                node: {
                  isPristine: false,
                  newFormData: {
                    contactId: 5,
                    projectId: 2,
                    contactIndex: 1,
                  },
                  asProjectContact: {
                    contactByContactId: {
                      fullName: "test primary contact",
                    },
                  },
                },
              },
            ],
          },
        };
      },
    });
    pageTestingHelper.renderPage();
    expect(screen.getByText(/test-summary/)).toBeInTheDocument();
    expect(screen.getByText(/test-legal-name/i)).toBeInTheDocument();
    expect(screen.getByText(/test-project-name/i)).toBeInTheDocument();
    expect(screen.getByText(/test-project-status-name/i)).toBeInTheDocument();
    expect(screen.getByText(/test-prop-reference/i)).toBeInTheDocument();
    expect(screen.getByText(/\$5.00/i)).toBeInTheDocument();
    expect(
      screen.getByText(/test-funding-stream-description - 2020/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/test manager one/i)).toBeInTheDocument();
    expect(screen.getByText(/test manager two/i)).toBeInTheDocument();
    expect(screen.getByText(/test manager three/i)).toBeInTheDocument();
    expect(screen.getByText(/test primary contact/i)).toBeInTheDocument();
    expect(screen.getByText(/test secondary contact/i)).toBeInTheDocument();
  });

  it("Shows a confirmation alert when clicking the Discard Project Revision button", async () => {
    const useMutationSpy = jest.fn();
    jest
      .spyOn(require("mutations/useMutationWithErrorMessage"), "default")
      .mockImplementation(() => [useMutationSpy, false]);

    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    act(() => userEvent.click(screen.queryByText("Discard Project Revision")));
    expect(
      screen.getByText(/All changes made will be permanently deleted/i)
    ).toBeInTheDocument();
  });

  it("Calls the delete mutation when the user clicks 'Proceed' in the confirmation alert", async () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    await act(async () => {
      userEvent.click(screen.getByText("Discard Project Revision"));
    });
    userEvent.click(screen.getByText("Proceed"));

    const mutationUnderTest =
      pageTestingHelper.environment.mock.getMostRecentOperation();

    expect(mutationUnderTest.fragment.node.name).toBe(
      "deleteProjectRevisionMutation"
    );

    expect(mutationUnderTest.request.variables).toMatchObject({
      input: {
        revisionId: 123456,
      },
    });
  });

  it("renders a disabled submit / discard button when project revision mutations are in flight", async () => {
    jest
      .spyOn(require("mutations/useMutationWithErrorMessage"), "default")
      .mockImplementation(() => [jest.fn(), true]);

    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    expect(screen.queryByText("Submit")).toHaveProperty("disabled", true);
    expect(screen.queryByText("Discard Project Revision")).toHaveProperty(
      "disabled",
      true
    );
  });

  it("calls the commitProjectRevision mutation when the Submit button is clicked", () => {
    // We need a non-null amount of form changes
    const mockResolver = {
      ...defaultMockResolver,
      FormChange() {
        return {
          validationErrors: [],
        };
      },
    };
    pageTestingHelper.loadQuery(mockResolver);
    pageTestingHelper.renderPage();
    userEvent.click(screen.queryByText("Submit"));

    pageTestingHelper.expectMutationToBeCalled(
      "useCommitProjectRevisionMutation",
      {
        input: {
          revisionToCommitId: 123456,
        },
      }
    );
  });

  it("displays an error when the Submit Button is clicked & commitProjectRevisionMutation fails", () => {
    const mockResolver = {
      ...defaultMockResolver,
      FormChange() {
        return {
          validationErrors: [],
        };
      },
    };
    pageTestingHelper.loadQuery(mockResolver);
    pageTestingHelper.renderPage();
    userEvent.click(screen.queryByText("Submit"));
    act(() => {
      pageTestingHelper.environment.mock.rejectMostRecentOperation(new Error());
    });
    expect(pageTestingHelper.errorContext.setError).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(
        "An error occurred while attempting to commit the project revision."
      )
    ).toBeVisible();
  });

  it("displays an error when the deleteProjectRevision mutation fails", async () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();
    await act(() => {
      userEvent.click(screen.queryByText("Discard Project Revision"));
    });
    await act(() => {
      userEvent.click(screen.queryByText("Proceed"));
      pageTestingHelper.environment.mock.rejectMostRecentOperation(new Error());
      expect(pageTestingHelper.errorContext.setError).toHaveBeenCalledTimes(1);
    });
    expect(
      screen.getByText(
        "An error occurred while attempting to delete the project revision."
      )
    ).toBeVisible();
  });

  it("renders null when a revision doesn't exist", async () => {
    const spy = jest.spyOn(
      require("app/hooks/useRedirectTo404IfFalsy"),
      "default"
    );

    pageTestingHelper.loadQuery({
      Query() {
        return {
          projectRevision: null,
        };
      },
    });

    const { container } = pageTestingHelper.renderPage();

    expect(container.childElementCount).toEqual(0);
    expect(spy).toHaveBeenCalledWith(null);
  });

  it("submit is disabled if primary contact is empty", () => {
    const mockResolver = {
      ...defaultMockResolver,
      projectContactFormChanges() {
        return {
          edges: [
            {
              node: {
                newFormData: {
                  contactId: null,
                  projectId: 1,
                  contactIndex: 1,
                },
              },
            },
          ],
        };
      },
    };
    pageTestingHelper.loadQuery(mockResolver);
    pageTestingHelper.renderPage();
    expect(screen.getByText("Submit")).toBeDisabled();
  });

  it("submit is disabled if there are any validation errors", () => {
    const mockResolver = {
      ...defaultMockResolver,
      FormChange() {
        return {
          validationErrors: ["Validation error here"],
        };
      },
    };
    pageTestingHelper.loadQuery(mockResolver);
    pageTestingHelper.renderPage();
    expect(screen.getByText("Submit")).toBeDisabled();
  });
  it("submit is enabled if there are no validation errors", () => {
    const mockResolver = {
      ...defaultMockResolver,
      FormChange() {
        return {
          validationErrors: [],
        };
      },
    };
    pageTestingHelper.loadQuery(mockResolver);
    pageTestingHelper.renderPage();
    expect(screen.getByText("Submit")).toBeEnabled();
  });

  it("routes to the project list page when discarding a project revision and isFirstRevision is true", async () => {
    const mockResolver = {
      Form() {
        return {
          jsonSchema: reportingRequirementProdSchema,
        };
      },
      ProjectRevision() {
        return {
          isFirstRevision: true,
          summaryMilestoneReportingRequirementFormChanges: {
            edges: [],
          },
          summaryMilestoneFormChanges: {
            edges: [],
          },
          summaryMilestonePaymentFormChanges: {
            edges: [],
          },
        };
      },
    };
    pageTestingHelper.loadQuery(mockResolver);
    pageTestingHelper.renderPage();

    await act(() =>
      userEvent.click(screen.queryByText("Discard Project Revision"))
    );

    userEvent.click(screen.queryByText("Proceed"));

    act(() => {
      pageTestingHelper.environment.mock.resolveMostRecentOperation({
        data: { input: "asdf" },
      });
    });

    expect(pageTestingHelper.router.push).toHaveBeenCalledWith({
      pathname: "/cif/projects/",
    });
  });

  it("routes to the project overview when discarding project revision and isFirstRevision is false", async () => {
    const mockResolver = {
      Form() {
        return {
          jsonSchema: reportingRequirementProdSchema,
        };
      },
      ProjectRevision() {
        return {
          id: "mock-proj-rev-id",
          isFirstRevision: false,
          projectByProjectId: {
            latestCommittedProjectRevision: {
              id: "last-revision-id",
            },
          },
          summaryMilestoneReportingRequirementFormChanges: {
            edges: [],
          },
          summaryMilestoneFormChanges: {
            edges: [],
          },
          summaryMilestonePaymentFormChanges: {
            edges: [],
          },
        };
      },
    };
    pageTestingHelper.loadQuery(mockResolver);
    pageTestingHelper.renderPage();

    await act(() =>
      userEvent.click(screen.queryByText("Discard Project Revision"))
    );
    userEvent.click(screen.queryByText("Proceed"));

    act(() => {
      pageTestingHelper.environment.mock.resolveMostRecentOperation({
        data: { input: "asdf" },
      });
    });

    expect(pageTestingHelper.router.push).toHaveBeenCalledWith({
      pathname: "/cif/project-revision/[projectRevision]/",
      query: {
        projectRevision: "mock-proj-rev-id",
      },
    });
  });
});
