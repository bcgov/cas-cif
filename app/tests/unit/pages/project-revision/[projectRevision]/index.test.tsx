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
      isFirstRevision: true,
      id: "mock-proj-rev-id",
      projectByProjectId: null,
      projectFormChange: {
        newFormData: {
          someProjectData: "test2",
        },
      },
      projectContactFormChanges: {
        edges: [
          {
            node: {
              id: "mock-project-contact-form-id",
              newFormData: {
                contactIndex: 1,
                contactid: 1,
                projectId: 1,
              },
            },
          },
        ],
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

    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    expect(screen.getByText("Submit")).toHaveProperty("disabled", false);
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

    expect(
      screen.getByText(/Project overview not updated/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Project managers not updated/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Project contacts not updated/)
    ).toBeInTheDocument();
  });

  it("Renders the summary with overview details when isFirstRevision is true", async () => {
    pageTestingHelper.loadQuery({
      ProjectRevision() {
        return {
          isFirstRevision: true,
          id: "Test Project Revision ID",
          projectFormChange: {
            isPristine: false,
            id: "mock-project-form-id",
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
                  description: "test-funding-stream",
                },
              },
              projectStatusByProjectStatusId: {
                name: "test-project-status",
              },
            },
            formChangeByPreviousFormChangeId: undefined,
          },
          allProjectManagerFormChangesByLabel: undefined,
          projectContactFormChanges: undefined,
        };
      },
    });
    pageTestingHelper.renderPage();

    expect(screen.getByText(/test-summary/)).toBeInTheDocument();
    expect(screen.getByText(/test-legal-name/i)).toBeInTheDocument();
    expect(screen.getByText(/test-project-name/i)).toBeInTheDocument();
    expect(screen.getByText(/test-project-status/i)).toBeInTheDocument();
    expect(screen.getByText(/test-prop-reference/i)).toBeInTheDocument();
  });

  it("Renders the summary with the filled-out details when creating a project", async () => {
    pageTestingHelper.loadQuery({
      ProjectRevision() {
        return {
          isFirstRevision: true,
          id: "Test Project Revision ID",
          projectFormChange: {
            isPristine: false,
            id: "mock-project-form-id",
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
                  description: "test-funding-stream",
                },
              },
              projectStatusByProjectStatusId: {
                name: "test-project-status",
              },
            },
            formChangeByPreviousFormChangeId: undefined,
          },
          allProjectManagerFormChangesByLabel: {
            edges: [
              {
                node: {
                  formChange: {
                    newFormData: {
                      projectId: 1,
                      projectManagerLabelId: 1,
                      cifUserid: 1,
                    },
                    isPristine: false,
                    operation: "CREATE",
                    asProjectManager: {
                      cifUserByCifUserId: {
                        fullName: "test-project-manager-name",
                      },
                    },
                    formChangeByPreviousFormChangeId: undefined,
                  },
                  projectManagerLabel: {
                    label: "test-project-manager-label",
                  },
                },
              },
            ],
          },
          projectContactFormChanges: {
            edges: [
              {
                node: {
                  isPristine: false,
                  newFormData: {
                    projectId: 1,
                    contactId: 1,
                    contactIndex: 1,
                  },
                  operation: "CREATE",
                  asProjectContact: {
                    contactByContactId: {
                      fullName: "test-contact-name",
                    },
                  },
                  formChangeByPreviousFormChangeId: null,
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
    expect(screen.getByText(/test-project-status/i)).toBeInTheDocument();
    expect(screen.getByText(/test-prop-reference/i)).toBeInTheDocument();
    expect(screen.getByText(/\$5.00/i)).toBeInTheDocument();
    expect(screen.getByText(/test-funding-stream - 2020/i)).toBeInTheDocument();
    expect(screen.getByText(/test-project-manager-name/i)).toBeInTheDocument();
    expect(screen.getByText(/test-contact-name/i)).toBeInTheDocument();
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
    pageTestingHelper.loadQuery();
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
});

describe("The Edit Project page", () => {
  beforeEach(() => {
    pageTestingHelper.reinit();
    jest.restoreAllMocks();
  });

  it("Renders the summary with only the overview details that changed and a diff when both isPristine and isFirstRevision are false", async () => {
    pageTestingHelper.loadQuery({
      ProjectRevision() {
        return {
          isFirstRevision: false,
          id: "Test Project Revision ID",
          projectFormChange: {
            isPristine: false,
            id: "mock-project-form-id",
            newFormData: {
              summary: "test-summary",
              operatorId: 3,
              projectName: "test-project-name",
              projectStatusId: 1,
              proposalReference: "test-prop-reference-first-revision",
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
                  description: "test-funding-stream",
                },
              },
              projectStatusByProjectStatusId: {
                name: "test-project-status",
              },
            },
            formChangeByPreviousFormChangeId: {
              id: "old-project-form-id",
              newFormData: {
                summary: "test-summary",
                operatorId: 3,
                projectName: "test-project-name",
                projectStatusId: 1,
                proposalReference: "test-prop-reference-changed",
                fundingStreamRfpId: 2,
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
                    description: "test-funding-stream",
                  },
                },
                projectStatusByProjectStatusId: {
                  name: "test-project-status",
                },
              },
            },
          },
        };
      },
    });
    pageTestingHelper.renderPage();

    expect(screen.queryByText(/test-summary/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/test-prop-reference-changed/)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/test-prop-reference-first-revision/)
    ).toBeInTheDocument();
  });

  it("Renders the summary with Project Overview not updated when isPristine is true", async () => {
    pageTestingHelper.loadQuery({
      ProjectRevision() {
        return {
          isFirstRevision: false,
          id: "Test Project Revision ID",
          projectFormChange: {
            isPristine: true,
            id: "mock-project-form-id",
            newFormData: {
              summary: "test-summary",
              operatorId: 3,
              projectName: "test-project-name",
              projectStatusId: 1,
              proposalReference: "test-prop-reference-first-revision",
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
                  description: "test-funding-stream",
                },
              },
              projectStatusByProjectStatusId: {
                name: "test-project-status",
              },
            },
            formChangeByPreviousFormChangeId: {
              newFormData: {
                summary: "test-summary",
                operatorId: 3,
                projectName: "test-project-name",
                projectStatusId: 1,
                proposalReference: "test-prop-reference-changed",
                fundingStreamRfpId: 2,
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
                    description: "test-funding-stream",
                  },
                },
                projectStatusByProjectStatusId: {
                  name: "test-project-status",
                },
              },
            },
          },
        };
      },
    });
    pageTestingHelper.renderPage();

    expect(
      screen.getByText(/Project overview not updated/)
    ).toBeInTheDocument();
  });
});
