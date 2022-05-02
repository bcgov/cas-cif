import "@testing-library/jest-dom";
import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mocked } from "jest-mock";
import { useRouter } from "next/router";
import { ProjectRevision } from "pages/cif/project-revision/[projectRevision]";
import PageTestingHelper from "tests/helpers/pageTestingHelper";
import compiledProjectRevisionQuery, {
  ProjectRevisionQuery,
} from "__generated__/ProjectRevisionQuery.graphql";

jest.mock("next/router");

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
      projectByProjectId: null,
      projectFormChange: {
        id: "mock-project-form-id",
        newFormData: {
          someProjectData: "test2",
        },
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
    const router = mocked(useRouter);
    const mockPathname = "/cif/project-revision/[projectRevision]";
    router.mockReturnValue({
      pathname: mockPathname,
    } as any);

    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();
    expect(
      within(
        screen.getByRole("navigation", { name: "side navigation" })
      ).getByText(/Add a Project/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/review and submit information/i).closest("li")
    ).toHaveAttribute("aria-current", "step");
  });

  it("Renders an enabled submit and discard changes button", async () => {
    jest
      .spyOn(require("mutations/useDebouncedMutation"), "default")
      .mockImplementation(() => [jest.fn(), false]);
    const mockresolver = {
      ...defaultMockResolver,
      FormChange() {
        return {
          validationErrors: [],
        };
      },
    };
    pageTestingHelper.loadQuery(mockresolver);
    pageTestingHelper.renderPage();
    expect(screen.getByText("Submit")).not.toBeDisabled();
    expect(screen.getByText("Discard Changes")).toHaveProperty(
      "disabled",
      false
    );
  });

  it("Renders an empty summary before the form has been filled out", async () => {
    pageTestingHelper.loadQuery({
      ProjectRevision() {
        return {
          id: "mock-proj-rev-id",
          projectFormChange: { newFormData: {} },
        };
      },
    });
    pageTestingHelper.renderPage();

    expect(screen.getByText(/Project overview not added/)).toBeInTheDocument();
    expect(screen.getByText(/Project managers not added/)).toBeInTheDocument();
    expect(screen.getByText(/Primary contact not added/)).toBeInTheDocument();
  });

  it("Renders the summary with the filled-out details", async () => {
    pageTestingHelper.loadQuery({
      ProjectRevision() {
        return {
          id: "Test Project Revision ID",
          projectFormChange: {
            id: "mock-project-form-id",
            newFormData: {
              summary: "test-summary",
              operatorId: 3,
              projectName: "test-proj",
              projectStatusId: 1,
              proposalReference: "test-prop-reference",
              fundingStreamRfpId: 1,
              totalFundingRequest: 5,
            },
          },
          projectManagerFormChangesByLabel: {
            edges: [
              {
                node: {
                  formChange: {
                    newFormData: {
                      cifUserId: 4,
                      projectId: 2,
                      projectManagerLabelId: 1,
                    },
                  },
                  projectManagerLabel: {
                    label: "Tech Team Primary",
                  },
                },
              },
              {
                node: {
                  formChange: {
                    newFormData: {
                      cifUserId: 5,
                      projectId: 2,
                      projectManagerLabelId: 2,
                    },
                  },
                  projectManagerLabel: {
                    label: "Tech Team Secondary",
                  },
                },
              },
              {
                node: {
                  formChange: {
                    newFormData: {
                      cifUserId: 6,
                      projectId: 2,
                      projectManagerLabelId: 3,
                    },
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
          projectContactFormChanges: {
            edges: [
              {
                node: {
                  newFormData: {
                    contactId: 2,
                    projectId: 2,
                    contactIndex: 2,
                  },
                },
              },
              {
                node: {
                  newFormData: {
                    contactId: 5,
                    projectId: 2,
                    contactIndex: 1,
                  },
                },
              },
            ],
          },
        };
      },
      Query() {
        return {
          allCifUsers: {
            edges: [
              {
                node: {
                  rowId: 4,
                  id: "WyJjaWZfdXNlcnMiLDRd",
                  fullName: "Knope, Leslie",
                },
              },
              {
                node: {
                  rowId: 5,
                  id: "WyJjaWZfdXNlcnMiLDVd",
                  fullName: "Swanson, Ron",
                },
              },
              {
                node: {
                  rowId: 6,
                  id: "WyJjaWZfdXNlcnMiLDZd",
                  fullName: "Ludgate, April",
                },
              },
            ],
          },
          allContacts: {
            edges: [
              {
                node: {
                  rowId: 2,
                  id: "WyJjb250YWN0cyIsMl0=",
                  fullName: "Loblaw002, Bob002",
                },
              },

              {
                node: {
                  rowId: 5,
                  id: "WyJjb250YWN0cyIsNV0=",
                  fullName: "Loblaw005, Bob005",
                },
              },
            ],
          },
          allFundingStreamRfps: {
            edges: [
              {
                node: {
                  fundingStreamByFundingStreamId: {
                    name: "EP",
                    description: "Emissions Performance",
                  },
                  rowId: 1,
                  year: 2019,
                },
              },
            ],
          },
          allOperators: {
            edges: [
              {
                node: {
                  rowId: 3,
                  legalName: "third operator legal name",
                  bcRegistryId: "EF3456789",
                },
              },
            ],
          },
          allProjectStatuses: {
            edges: [
              {
                node: {
                  name: "Proposal Submitted",
                  rowId: 1,
                },
              },
            ],
          },
        };
      },
    });
    pageTestingHelper.renderPage();

    expect(screen.getByText(/test-summary/)).toBeInTheDocument();
    expect(screen.getByText(/third operator legal name/i)).toBeInTheDocument();
    expect(screen.getByText(/test-proj/i)).toBeInTheDocument();
    expect(screen.getByText(/proposal submitted/i)).toBeInTheDocument();
    expect(screen.getByText(/test-prop-reference/i)).toBeInTheDocument();
    expect(screen.getByText(/\$5.00/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Emissions Performance - 2019/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Knope, Leslie/i)).toBeInTheDocument();
    expect(screen.getByText(/Swanson, Ron/i)).toBeInTheDocument();
    expect(screen.getByText(/Ludgate, April/i)).toBeInTheDocument();
    expect(screen.getByText(/Loblaw005, Bob005/i)).toBeInTheDocument();
    expect(screen.getByText(/Loblaw002, Bob002/i)).toBeInTheDocument();
    expect(screen.getByText("Submit")).toBeEnabled();
    expect(screen.getByText("Discard Changes")).toHaveProperty(
      "disabled",
      false
    );
  });

  it("Calls the delete mutation when the user clicks the Discard Changes button", async () => {
    const useMutationSpy = jest.fn();
    jest
      .spyOn(require("mutations/useMutationWithErrorMessage"), "default")
      .mockImplementation(() => [useMutationSpy, false]);

    jest.spyOn(require("next/router"), "useRouter").mockImplementation(() => {
      return { push: jest.fn() };
    });

    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    act(() => userEvent.click(screen.queryByText("Discard Changes")));

    expect(useMutationSpy).toHaveBeenCalledTimes(1);
    expect(useMutationSpy).toHaveBeenCalledWith({
      onCompleted: expect.any(Function),
      onError: expect.any(Function),
      variables: {
        input: {
          id: "mock-proj-rev-id",
        },
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
    expect(screen.queryByText("Discard Changes")).toHaveProperty(
      "disabled",
      true
    );
  });

  it("displays an error when the Submit Button is clicked & updateProjectRevisionMutation fails", () => {
    const mockresolver = {
      ...defaultMockResolver,
      FormChange() {
        return {
          validationErrors: [],
        };
      },
    };
    pageTestingHelper.loadQuery(mockresolver);
    pageTestingHelper.renderPage();
    userEvent.click(screen.queryByText("Submit"));
    act(() => {
      pageTestingHelper.environment.mock.rejectMostRecentOperation(new Error());
    });
    expect(pageTestingHelper.errorContext.setError).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(
        "An error occurred while attempting to update the project revision."
      )
    ).toBeVisible();
  });

  it("displays an error when the user clicks the Discard Changes button & deleteProjectRevision mutation fails", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();
    userEvent.click(screen.queryByText("Discard Changes"));
    act(() => {
      pageTestingHelper.environment.mock.rejectMostRecentOperation(new Error());
    });
    expect(pageTestingHelper.errorContext.setError).toHaveBeenCalledTimes(1);
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

    mocked(useRouter).mockReturnValue({
      replace: jest.fn(),
    } as any);
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
    const mockresolver = {
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
    pageTestingHelper.loadQuery(mockresolver);
    pageTestingHelper.renderPage();
    expect(screen.getByText("Submit")).toBeDisabled();
  });

  it("submit is disabled if there are any validation errors", () => {
    const mockresolver = {
      ...defaultMockResolver,
      FormChange() {
        return {
          validationErrors: ["Validation error here"],
        };
      },
    };
    pageTestingHelper.loadQuery(mockresolver);
    pageTestingHelper.renderPage();
    expect(screen.getByText("Submit")).toBeDisabled();
  });
});
