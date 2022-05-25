import "@testing-library/jest-dom";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  getProjectRevisionPageRoute,
  getProjectRevisionQuarterlyReportsFormPageRoute,
} from "pageRoutes";
import { ProjectContactsPage } from "pages/cif/project-revision/[projectRevision]/form/2";
import PageTestingHelper from "tests/helpers/pageTestingHelper";
import compiledContactsFormQuery, {
  contactsFormQuery,
} from "__generated__/contactsFormQuery.graphql";
import { ProjectContactForm_query$data } from "__generated__/ProjectContactForm_query.graphql";
/***
 * https://relay.dev/docs/next/guides/testing-relay-with-preloaded-queries/#configure-the-query-resolver-to-generate-the-response
 * To find the key of the generated operation, one can call
 * `console.log(JSON.stringify(operation, null, 2))`
 * just before returning the MockPayloadGenerator and looking for concreteType instances *
 */

const defaultMockResolver = {
  ProjectRevision() {
    return {
      id: "mock-proj-rev-id",
      projectByProjectId: {
        proposalReference: "001",
      },
      projectFormChange: {
        id: "mock-project-form-id",
        newFormData: {
          someProjectData: "test2",
        },
      },
    };
  },
};

const pageTestingHelper = new PageTestingHelper<contactsFormQuery>({
  pageComponent: ProjectContactsPage,
  compiledQuery: compiledContactsFormQuery,
  defaultQueryResolver: defaultMockResolver,
  defaultQueryVariables: {
    projectRevision: "mock-id",
  },
});

describe("The Project Contacts page", () => {
  beforeEach(() => {
    pageTestingHelper.reinit();
  });

  it("renders the task list in the left navigation with correct highlighting", () => {
    const mockPathname = "/cif/project-revision/[projectRevision]/form/2";

    pageTestingHelper.setMockRouterValues({ pathname: mockPathname });

    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();
    expect(
      within(
        screen.getByRole("navigation", { name: "side navigation" })
      ).getByText(/Editing: 001/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Edit project contacts/i).closest("li")
    ).toHaveAttribute("aria-current", "step");
  });

  it("sends a mutation that resets the form to empty when the user clicks the Undo Changes button while adding a new project", () => {
    pageTestingHelper.loadQuery({
      ProjectRevision() {
        const revision = {
          id: "mock-proj-rev-id",
          rowId: 56,
          isFirstRevision: false,
          projectContactFormChanges: {
            edges: [
              {
                node: {
                  id: "mock-proj-contact-form-id",
                  newFormData: {
                    contactId: 1,
                    projectId: 53,
                    contactIndex: 1,
                  },
                  operation: "CREATE",
                  changeStatus: "pending",
                  formChangeByPreviousFormChangeId: null,
                },
              },
            ],
          },
        };
        return revision;
      },
      Query() {
        const query: Partial<ProjectContactForm_query$data> = {
          allContacts: {
            edges: [
              {
                node: {
                  rowId: 1,
                  fullName: "Loblaw001, Bob001",
                },
              },
            ],
          },
        };
        return query;
      },
    });
    pageTestingHelper.renderPage();
    expect(screen.getByLabelText(/primary contact/i)).toHaveValue(
      "Loblaw001, Bob001"
    );
    userEvent.click(screen.getByText(/Undo Changes/i));

    expect(pageTestingHelper.environment.mock.getAllOperations()).toHaveLength(
      2
    );

    const mutationUnderTest =
      pageTestingHelper.environment.mock.getAllOperations()[1];

    expect(mutationUnderTest.fragment.node.name).toBe(
      "updateProjectContactFormChangeMutation"
    );

    expect(mutationUnderTest.request.variables).toMatchObject({
      input: {
        formChangePatch: {
          changeStatus: "pending",
          newFormData: { contactIndex: 1, projectId: 53 },
        },
      },
    });
  });

  it("sends a mutation that resets the form to the previous committed data when the user clicks the Undo Changes button while editing an existing project", async () => {
    pageTestingHelper.loadQuery({
      ProjectRevision() {
        const revision = {
          id: "mock-proj-rev-id",
          rowId: 1,
          isFirstRevision: false,
          projectContactFormChanges: {
            edges: [
              {
                node: {
                  id: "test-primary-contact",
                  newFormData: {
                    contactId: 3,
                    projectId: 54,
                    contactIndex: 1,
                  },
                  operation: "UPDATE",
                  changeStatus: "pending",
                  formChangeByPreviousFormChangeId: {
                    changeStatus: "committed",
                    newFormData: {
                      contactId: 1,
                      projectId: 54,
                      contactIndex: 1,
                    },
                  },
                },
              },
              {
                node: {
                  id: "test-secondary-contact",
                  newFormData: {
                    contactId: 4,
                    projectId: 54,
                    contactIndex: 2,
                  },
                  operation: "UPDATE",
                  changeStatus: "pending",
                  formChangeByPreviousFormChangeId: {
                    changeStatus: "committed",
                    newFormData: {
                      contactId: 2,
                      projectId: 54,
                      contactIndex: 2,
                    },
                  },
                },
              },
            ],
          },
        };
        return revision;
      },
      Query() {
        const query: Partial<ProjectContactForm_query$data> = {
          allContacts: {
            edges: [
              {
                node: {
                  rowId: 1,
                  fullName: "Loblaw001, Bob001",
                },
              },
              {
                node: {
                  rowId: 2,
                  fullName: "Loblaw002, Bob002",
                },
              },
              {
                node: {
                  rowId: 3,
                  fullName: "Loblaw003, Bob003",
                },
              },
              {
                node: {
                  rowId: 4,
                  fullName: "Loblaw004, Bob004",
                },
              },
            ],
          },
        };
        return query;
      },
    });
    const { container } = pageTestingHelper.renderPage();
    const secondaryContact = container.querySelector(
      '[id="form-test-secondary-contact_contactId"]'
    );

    expect(screen.getByLabelText(/primary contact/i)).toHaveValue(
      "Loblaw003, Bob003"
    );
    expect(secondaryContact).toHaveValue("Loblaw004, Bob004");

    userEvent.click(screen.getByText(/Undo Changes/i));

    expect(pageTestingHelper.environment.mock.getAllOperations()).toHaveLength(
      3
    );

    const mutation1UnderTest =
      pageTestingHelper.environment.mock.getAllOperations()[1];

    expect(mutation1UnderTest.fragment.node.name).toBe(
      "updateProjectContactFormChangeMutation"
    );

    expect(mutation1UnderTest.request.variables).toMatchObject({
      input: {
        formChangePatch: {
          changeStatus: "pending",
          newFormData: { contactId: 1, contactIndex: 1, projectId: 54 },
        },
      },
    });

    const mutation2UnderTest =
      pageTestingHelper.environment.mock.getAllOperations()[2];

    expect(mutation2UnderTest.fragment.node.name).toBe(
      "updateProjectContactFormChangeMutation"
    );

    expect(mutation2UnderTest.request.variables).toMatchObject({
      input: {
        formChangePatch: {
          changeStatus: "pending",
          newFormData: { contactId: 2, contactIndex: 2, projectId: 54 },
        },
      },
    });
  });

  it("redirects the user to the project revision page on submit when the user is editing a project", () => {
    let handleSubmit;
    jest
      .spyOn(require("components/Form/ProjectContactForm"), "default")
      .mockImplementation((props: any) => {
        handleSubmit = () => props.onSubmit();
        return null;
      });

    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();
    handleSubmit();
    expect(pageTestingHelper.router.push).toHaveBeenCalledWith(
      getProjectRevisionPageRoute("mock-proj-rev-id")
    );
  });

  it("redirects the user to the quarterly reports page on submit when the user is creating a project", () => {
    let handleSubmit;
    jest
      .spyOn(require("components/Form/ProjectContactForm"), "default")
      .mockImplementation((props: any) => {
        handleSubmit = () => props.onSubmit();
        return null;
      });

    pageTestingHelper.loadQuery({
      ProjectRevision() {
        return {
          id: "mock-proj-rev-id",
          projectId: null,
          projectByProjectId: null,
          projectFormChange: null,
        };
      },
    });
    pageTestingHelper.renderPage();
    handleSubmit();
    expect(pageTestingHelper.router.push).toHaveBeenCalledWith(
      getProjectRevisionQuarterlyReportsFormPageRoute("mock-proj-rev-id")
    );
  });

  it("renders null and redirects to a 404 page when a revision doesn't exist", async () => {
    pageTestingHelper.loadQuery({
      Query() {
        return {
          projectRevision: null,
        };
      },
    });

    const { container } = pageTestingHelper.renderPage();

    expect(container.childElementCount).toEqual(0);
    expect(pageTestingHelper.router.replace).toHaveBeenCalledWith("/404");
  });

  it("renders the form in view mode when the project revision is committed", async () => {
    pageTestingHelper.loadQuery({
      ProjectRevision(context) {
        const revision = {
          id: context.path.includes("pendingProjectRevision")
            ? "mock-pending-revision-id"
            : "mock-base-revision-id",
          rowId: 1,
          changeStatus: "committed",
          isFirstRevision: false,
          summaryContactFormChanges: {
            edges: [
              {
                node: {
                  isPristine: true,
                  id: "test-primary-contact",
                  newFormData: {
                    contactId: 3,
                    projectId: 54,
                    contactIndex: 1,
                  },
                  asProjectContact: {
                    contactByContactId: {
                      fullName: "Test Primary",
                    },
                  },
                  operation: "UPDATE",
                  changeStatus: "committed",
                  formChangeByPreviousFormChangeId: {
                    changeStatus: "committed",
                    newFormData: {
                      contactId: 1,
                      projectId: 54,
                      contactIndex: 1,
                    },
                    asProjectContact: {
                      contactByContactId: {
                        fullName: "Test Primary OLD",
                      },
                    },
                  },
                },
              },
              {
                node: {
                  isPristine: false,
                  id: "test-secondary-contact",
                  newFormData: {
                    contactId: 4,
                    projectId: 54,
                    contactIndex: 2,
                  },
                  asProjectContact: {
                    contactByContactId: {
                      fullName: "Test Secondary",
                    },
                  },
                  operation: "UPDATE",
                  changeStatus: "committed",
                  formChangeByPreviousFormChangeId: {
                    changeStatus: "committed",
                    newFormData: {
                      contactId: 2,
                      projectId: 54,
                      contactIndex: 2,
                    },
                    asProjectContact: {
                      contactByContactId: {
                        fullName: "Test Secondary OLD",
                      },
                    },
                  },
                },
              },
            ],
          },
        };
        return revision;
      },
      Query() {
        const query: Partial<ProjectContactForm_query$data> = {
          allContacts: {
            edges: [
              {
                node: {
                  rowId: 1,
                  fullName: "Loblaw001, Bob001",
                },
              },
              {
                node: {
                  rowId: 2,
                  fullName: "Loblaw002, Bob002",
                },
              },
              {
                node: {
                  rowId: 3,
                  fullName: "Loblaw003, Bob003",
                },
              },
              {
                node: {
                  rowId: 4,
                  fullName: "Loblaw004, Bob004",
                },
              },
            ],
          },
        };
        return query;
      },
    });
    pageTestingHelper.renderPage();
    expect(
      screen.queryByRole("button", { name: "submit" })
    ).not.toBeInTheDocument();
    expect(screen.getByText(/primary contact/i).nextSibling).toHaveTextContent(
      "Test Primary"
    );
    expect(
      screen.getByText(/secondary contact/i).nextSibling
    ).toHaveTextContent("Test Secondary");

    userEvent.click(screen.getByRole("button", { name: /resume edition/i }));
    expect(pageTestingHelper.router.push).toHaveBeenCalledWith({
      pathname: "/cif/project-revision/[projectRevision]/form/2/",
      query: { projectRevision: "mock-pending-revision-id" },
    });
  });
});
