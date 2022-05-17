import "@testing-library/jest-dom";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mocked } from "jest-mock";
import { useRouter } from "next/router";
import {
  getProjectRevisionManagersFormPageRoute,
  getProjectRevisionPageRoute,
} from "pageRoutes";
import { ProjectOverviewForm } from "pages/cif/project-revision/[projectRevision]/form/overview";
import PageTestingHelper from "tests/helpers/pageTestingHelper";
import compiledOverviewFormQuery, {
  overviewFormQuery,
} from "__generated__/overviewFormQuery.graphql";
import { ProjectForm_projectRevision$data } from "__generated__/ProjectForm_projectRevision.graphql";
import { SelectRfpWidget_query$data } from "__generated__/SelectRfpWidget_query.graphql";

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

const pageTestingHelper = new PageTestingHelper<overviewFormQuery>({
  pageComponent: ProjectOverviewForm,
  compiledQuery: compiledOverviewFormQuery,
  defaultQueryResolver: defaultMockResolver,
  defaultQueryVariables: {
    projectRevision: "mock-id",
  },
});

describe("The Project Overview page", () => {
  beforeEach(() => {
    pageTestingHelper.reinit();
  });

  it("renders the task list in the left navigation", () => {
    const router = mocked(useRouter);
    const mockPathname =
      "/cif/project-revision/[projectRevision]/form/overview";
    router.mockReturnValue({
      pathname: mockPathname,
    } as any);
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();
    expect(
      within(
        screen.getByRole("navigation", { name: "side navigation" })
      ).getByText(/Editing: 001/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Edit project overview/i).closest("li")
    ).toHaveAttribute("aria-current", "step");
  });

  it("undoes all changes (resets the form to empty) when the user clicks the Undo Changes button while adding a new project", () => {
    pageTestingHelper.loadQuery({
      ProjectRevision() {
        return {
          id: "mock-proj-rev-id",
          projectByProjectId: {
            proposalReference: "001",
          },
          projectFormChange: {
            id: "mock-project-form-id",
            newFormData: {
              summary: "sum",
              operatorId: 1,
              projectName: "test project 1",
              projectStatusId: 15,
              proposalReference: "ref",
              fundingStreamRfpId: 1,
              totalFundingRequest: 7,
            },
            isUniqueValue: true,
            formChangeByPreviousFormChangeId: null,
          },
        };
      },
      Query() {
        const query: Partial<SelectRfpWidget_query$data> = {
          allFundingStreams: {
            edges: [
              {
                node: {
                  name: "EP",
                  rowId: 1,
                  description: "Emissions Performance",
                },
              },
            ],
          },
          allFundingStreamRfps: {
            edges: [
              {
                node: {
                  fundingStreamId: 1,
                  rowId: 1,
                  year: 2019,
                },
              },
            ],
          },
        };
        return query;
      },
    });
    pageTestingHelper.renderPage();

    expect(screen.getByLabelText(/project name/i)).toHaveValue(
      "test project 1"
    );
    expect(screen.getByLabelText(/Total Funding Request/)).toHaveValue("$7.00");

    const beforeStream = screen.getByRole("option", {
      name: "Emissions Performance",
    }) as HTMLOptionElement;

    expect(beforeStream.selected).toBe(true);

    userEvent.click(screen.getByText(/Undo Changes/i));

    expect(pageTestingHelper.environment.mock.getAllOperations()).toHaveLength(
      2
    );

    const mutationUnderTest =
      pageTestingHelper.environment.mock.getAllOperations()[1];

    expect(mutationUnderTest.fragment.node.name).toBe(
      "updateProjectFormChangeMutation"
    );
    expect(mutationUnderTest.request.variables).toMatchObject({
      input: {
        formChangePatch: {
          changeStatus: "pending",
          newFormData: {},
        },
      },
    });
  });

  it("undoes all changes (resets the form to the previous committed data) when the user clicks the Undo Changes button while editing an existing project", () => {
    pageTestingHelper.loadQuery({
      ProjectRevision() {
        const revision: Partial<ProjectForm_projectRevision$data> = {
          projectFormChange: {
            id: "mock-project-form-id",
            newFormData: {
              summary: "sum",
              operatorId: 1,
              projectName: "test project edited",
              projectStatusId: 15,
              proposalReference: "ref",
              fundingStreamRfpId: 5,
              totalFundingRequest: 25,
            },
            isUniqueValue: true,
            formChangeByPreviousFormChangeId: {
              changeStatus: "committed",
              newFormData: {
                summary: "sum",
                operatorId: 1,
                projectName: "test project 1",
                projectStatusId: 15,
                proposalReference: "ref",
                fundingStreamRfpId: 1,
                totalFundingRequest: 99,
              },
            },
          },
        };
        return revision;
      },
      Query() {
        const query: Partial<SelectRfpWidget_query$data> = {
          allFundingStreams: {
            edges: [
              {
                node: {
                  name: "EP",
                  rowId: 1,
                  description: "Emissions Performance",
                },
              },
              {
                node: {
                  name: "IA",
                  rowId: 2,
                  description: "Innovation Accelerator",
                },
              },
            ],
          },
          allFundingStreamRfps: {
            edges: [
              {
                node: {
                  fundingStreamId: 1,
                  rowId: 1,
                  year: 2019,
                },
              },
              {
                node: {
                  fundingStreamId: 2,
                  rowId: 5,
                  year: 2021,
                },
              },
            ],
          },
        };
        return query;
      },
    });
    pageTestingHelper.renderPage();

    expect(screen.getByLabelText(/project name/i)).toHaveValue(
      "test project edited"
    );
    expect(screen.getByLabelText(/Total Funding Request/)).toHaveValue(
      "$25.00"
    );

    const beforeStream = screen.getByRole("option", {
      name: "Innovation Accelerator",
    }) as HTMLOptionElement;
    expect(beforeStream.selected).toBe(true);

    userEvent.click(screen.getByText(/Undo Changes/i));

    expect(pageTestingHelper.environment.mock.getAllOperations()).toHaveLength(
      2
    );
    const mutationUnderTest =
      pageTestingHelper.environment.mock.getAllOperations()[1];

    expect(mutationUnderTest.fragment.node.name).toBe(
      "updateProjectFormChangeMutation"
    );
    expect(
      pageTestingHelper.environment.mock.getAllOperations()[1].request.variables
    ).toMatchObject({
      input: {
        formChangePatch: {
          changeStatus: "pending",
          newFormData: {
            summary: "sum",
            operatorId: 1,
            projectName: "test project 1",
            projectStatusId: 15,
            proposalReference: "ref",
            fundingStreamRfpId: 1,
            totalFundingRequest: 99,
          },
        },
      },
    });
  });

  it("redirects the user to the project revision page on submit when editing", () => {
    const router = mocked(useRouter);
    const mockPush = jest.fn();
    router.mockReturnValue({
      push: mockPush,
    } as any);

    let handleSubmit;
    jest
      .spyOn(require("components/Form/ProjectForm"), "default")
      .mockImplementation((props: any) => {
        handleSubmit = () => props.onSubmit();
        return null;
      });

    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();
    handleSubmit();
    expect(mockPush).toHaveBeenCalledWith(
      getProjectRevisionPageRoute("mock-proj-rev-id")
    );
  });

  it("redirects the user to the project managers page on submit when creating a project", () => {
    const router = mocked(useRouter);
    const mockPush = jest.fn();
    router.mockReturnValue({
      push: mockPush,
    } as any);

    let handleSubmit;
    jest
      .spyOn(require("components/Form/ProjectForm"), "default")
      .mockImplementation((props: any) => {
        handleSubmit = () => props.onSubmit();
        return null;
      });

    pageTestingHelper.loadQuery({
      ProjectRevision() {
        return {
          id: "mock-proj-rev-id",
          projectByProjectId: null,
          projectFormChange: null,
        };
      },
    });
    pageTestingHelper.renderPage();
    handleSubmit();
    expect(mockPush).toHaveBeenCalledWith(
      getProjectRevisionManagersFormPageRoute("mock-proj-rev-id")
    );
  });

  it("renders null and redirects to a 404 page when a revision doesn't exist", async () => {
    const mockReplace = jest.fn();
    mocked(useRouter).mockReturnValue({
      replace: mockReplace,
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
    expect(mockReplace).toHaveBeenCalledWith("/404");
  });

  it("renders the form in view mode when the project revision is committed", () => {
    jest.mock("next/router");
    const routerPush = jest.fn();
    mocked(useRouter).mockReturnValue({ push: routerPush } as any);

    pageTestingHelper.loadQuery({
      ProjectRevision(context) {
        return {
          id: context.path.includes("pendingProjectRevision")
            ? "mock-pending-revision-id"
            : "mock-base-revision-id",
          changeStatus: "committed",

          projectFormChange: {
            id: "mock-project-form-id",
            newFormData: {
              summary: "sum",
              operatorId: 1,
              projectName: "test project",
              projectStatusId: 15,
              proposalReference: "ref",
              fundingStreamRfpId: 5,
              totalFundingRequest: 25,
            },
            asProject: {
              operatorByOperatorId: {
                legalName: "test operator",
                bcRegistryId: "12345",
              },
              fundingStreamRfpByFundingStreamRfpId: {
                year: 2020,
                fundingStreamByFundingStreamId: {
                  description: "test funding stream",
                },
              },
              projectStatusByProjectStatusId: {
                name: "test status",
              },
            },
            isUniqueValue: true,
            formChangeByPreviousFormChangeId: {
              changeStatus: "committed",
              newFormData: {
                summary: "sum",
                operatorId: 1,
                projectName: "test project 1",
                projectStatusId: 15,
                proposalReference: "ref",
                fundingStreamRfpId: 1,
                totalFundingRequest: 99,
              },
            },
          },
        };
      },
      Query() {
        const query: Partial<SelectRfpWidget_query$data> = {
          allFundingStreams: {
            edges: [
              {
                node: {
                  name: "EP",
                  rowId: 1,
                  description: "Emissions Performance",
                },
              },
              {
                node: {
                  name: "IA",
                  rowId: 2,
                  description: "Innovation Accelerator",
                },
              },
            ],
          },
          allFundingStreamRfps: {
            edges: [
              {
                node: {
                  fundingStreamId: 1,
                  rowId: 1,
                  year: 2019,
                },
              },
              {
                node: {
                  fundingStreamId: 2,
                  rowId: 5,
                  year: 2021,
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
    expect(
      screen.getByText(/funding stream rfp id/i).nextElementSibling
    ).toHaveTextContent(`test funding stream - 2020`);
    expect(
      screen.getByText(/proposal reference/i).nextElementSibling
    ).toHaveTextContent("ref");
    expect(
      screen.getByText(/project name/i).nextElementSibling
    ).toHaveTextContent("test project");
    expect(screen.getByText(/summary/i).nextElementSibling).toHaveTextContent(
      "sum"
    );
    expect(
      screen.getByText(/Total Funding Request/).nextElementSibling
    ).toHaveTextContent("$25.00");

    userEvent.click(screen.getByRole("button", { name: /resume edition/i }));
    expect(routerPush).toHaveBeenCalledWith({
      pathname: "/cif/project-revision/[projectRevision]/form/overview/",
      query: { projectRevision: "mock-pending-revision-id" },
    });
  });
});
