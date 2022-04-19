import React from "react";
import { ProjectRevision } from "pages/cif/project-revision/[projectRevision]";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import {
  createMockEnvironment,
  MockPayloadGenerator,
  RelayMockEnvironment,
} from "relay-test-utils";
import { RelayEnvironmentProvider, loadQuery } from "react-relay";
import compiledProjectRevisionQuery, {
  ProjectRevisionQuery,
  ProjectRevisionQuery$variables,
} from "__generated__/ProjectRevisionQuery.graphql";
import { mocked } from "jest-mock";
import { MockResolvers } from "relay-test-utils/lib/RelayMockPayloadGenerator";
import { useRouter } from "next/router";
import { ErrorContext } from "contexts/ErrorContext";

jest.mock("next/router");

/***
 * https://relay.dev/docs/next/guides/testing-relay-with-preloaded-queries/#configure-the-query-resolver-to-generate-the-response
 * To find the key of the generated operation, one can call
 * `console.log(JSON.stringify(operation, null, 2))`
 * just before returning the MockPayloadGenerator and looking for concreteType instances *
 */

let environment: RelayMockEnvironment;
let initialQueryRef;

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

const loadProjectRevisionQuery = (
  mockResolver: MockResolvers = defaultMockResolver
) => {
  const variables: ProjectRevisionQuery$variables = {
    projectRevision: "mock-id",
  };

  environment.mock.queueOperationResolver((operation) => {
    return MockPayloadGenerator.generate(operation, mockResolver);
  });

  environment.mock.queuePendingOperation(
    compiledProjectRevisionQuery,
    variables
  );
  initialQueryRef = loadQuery<ProjectRevisionQuery>(
    environment,
    compiledProjectRevisionQuery,
    variables
  );
};
let errorContext;
const renderProjectRevisionPage = () =>
  render(
    <ErrorContext.Provider value={errorContext}>
      <RelayEnvironmentProvider environment={environment}>
        <ProjectRevision CSN preloadedQuery={initialQueryRef} />
      </RelayEnvironmentProvider>
    </ErrorContext.Provider>
  );

describe("The Create Project page", () => {
  beforeEach(() => {
    environment = createMockEnvironment();
    errorContext = {
      error: null,
      setError: jest.fn().mockImplementation((error) =>
        act(() => {
          errorContext.error = error;
        })
      ),
    };
    jest.restoreAllMocks();
  });

  it("renders the task list in the left navigation with correct highlighting", () => {
    const router = mocked(useRouter);
    const mockPathname = "/cif/project-revision/[projectRevision]";
    router.mockReturnValue({
      pathname: mockPathname,
    } as any);

    loadProjectRevisionQuery();
    renderProjectRevisionPage();
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

    loadProjectRevisionQuery();
    renderProjectRevisionPage();

    expect(screen.getByText("Submit")).toHaveProperty("disabled", false);
    expect(screen.getByText("Discard Changes")).toHaveProperty(
      "disabled",
      false
    );
  });

  it("Renders an empty summary before the form has been filled out", async () => {
    loadProjectRevisionQuery({
      ProjectRevision() {
        return {
          id: "mock-proj-rev-id",
          projectFormChange: { newFormData: {} },
        };
      },
    });
    renderProjectRevisionPage();

    expect(screen.getByText(/Project overview not added/)).toBeInTheDocument();
    expect(screen.getByText(/Project managers not added/)).toBeInTheDocument();
    expect(screen.getByText(/Project contacts not added/)).toBeInTheDocument();
  });

  it("Renders the summary with the filled-out details", async () => {
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
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
                    tradeName: "third operator trade name",
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
      })
    );

    environment.mock.queuePendingOperation(compiledProjectRevisionQuery, {});
    renderProjectRevisionPage();

    expect(screen.getByText(/test-summary/)).toBeInTheDocument();
    expect(screen.getByText(/third operator legal name/i)).toBeInTheDocument();
    expect(screen.getByText(/third operator trade name/i)).toBeInTheDocument();
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
  });

  it("Calls the delete mutation when the user clicks the Discard Changes button", async () => {
    const useMutationSpy = jest.fn();
    jest
      .spyOn(require("mutations/useMutationWithErrorMessage"), "default")
      .mockImplementation(() => [useMutationSpy, false]);

    jest.spyOn(require("next/router"), "useRouter").mockImplementation(() => {
      return { push: jest.fn() };
    });

    loadProjectRevisionQuery();
    renderProjectRevisionPage();

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

    loadProjectRevisionQuery();
    renderProjectRevisionPage();

    expect(screen.queryByText("Submit")).toHaveProperty("disabled", true);
    expect(screen.queryByText("Discard Changes")).toHaveProperty(
      "disabled",
      true
    );
  });

  it("displays an error when the Submit Button is clicked & updateProjectRevisionMutation fails", () => {
    loadProjectRevisionQuery();
    renderProjectRevisionPage();
    userEvent.click(screen.queryByText("Submit"));
    act(() => {
      environment.mock.rejectMostRecentOperation(new Error());
    });
    expect(errorContext.setError).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(
        "An error occurred while attempting to update the project revision."
      )
    ).toBeVisible();
  });

  it("displays an error when the user clicks the Discard Changes button & deleteProjectRevision mutation fails", () => {
    loadProjectRevisionQuery();
    renderProjectRevisionPage();
    userEvent.click(screen.queryByText("Discard Changes"));
    act(() => {
      environment.mock.rejectMostRecentOperation(new Error());
    });
    expect(errorContext.setError).toHaveBeenCalledTimes(1);
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
    loadProjectRevisionQuery({
      Query() {
        return {
          projectRevision: null,
        };
      },
    });

    const { container } = renderProjectRevisionPage();

    expect(container.childElementCount).toEqual(0);
    expect(spy).toHaveBeenCalledWith(null);
  });
});
