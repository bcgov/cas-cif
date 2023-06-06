import { fireEvent, screen } from "@testing-library/react";
import TaskList from "components/TaskList";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledTaskListQuery, {
  TaskListQuery,
} from "__generated__/TaskListQuery.graphql";
import { DateTime, Settings } from "luxon";
import userEvent from "@testing-library/user-event";

const testQuery = graphql`
  query TaskListQuery($projectRevision: ID!) @relay_test_operation {
    query {
      # Spread the fragment you want to test here
      projectRevision(id: $projectRevision) {
        ...TaskList_projectRevision
      }
    }
  }
`;

const mockQueryPayload = {
  Query() {
    return {
      projectRevision: {
        id: "test-project-revision-id",
        rowId: 42,
        revisionType: "test-amendment",
        typeRowNumber: 6,
        projectFormChange: {
          asProject: {
            fundingStreamRfpByFundingStreamRfpId: {
              fundingStreamByFundingStreamId: {
                name: "EP",
              },
            },
          },
        },
        projectByProjectId: {
          proposalReference: "test-project-proposal-reference",
        },
        projectOverviewStatus: "test-project-overview-status",
        projectContactsStatus: "test-project-contacts-status",
        projectManagersStatus: "test-project-managers-status",
        quarterlyReportsStatus: "test-project-quarterly-reports-status",
        milestoneReportStatuses: {
          edges: [],
        },
        projectAttachmentsStatus: "test-project-attachments-status",
      },
    };
  },
};

const componentTestingHelper = new ComponentTestingHelper<TaskListQuery>({
  component: TaskList,
  testQuery: testQuery,
  compiledQuery: compiledTaskListQuery,
  getPropsFromTestQuery: (data) => ({
    projectRevision: data.query.projectRevision,
    mode: "update",
  }),
  defaultQueryResolver: mockQueryPayload,
  defaultQueryVariables: { projectRevision: "Test Revision ID" },
});

describe("The Tasklist", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    componentTestingHelper.reinit();
  });

  it("Renders the TaskList In edit", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(
      screen.getByText("Editing: test-project-proposal-reference")
    ).toBeInTheDocument();
  });

  it("Renders the TaskList In create", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent(undefined, { mode: "create" });
    expect(screen.getByText("Add a Project")).toBeInTheDocument();
  });

  it("Renders the TaskList in view", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent(undefined, { mode: "view" });

    expect(
      screen.getByText("test-project-proposal-reference")
    ).toBeInTheDocument();
  });

  it("Renders the proper form statuses", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    fireEvent.click(screen.getByText(/Project Overview/i));
    expect(
      screen.getByText("test-project-overview-status")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Project Details/i));
    expect(
      screen.getByText("test-project-contacts-status")
    ).toBeInTheDocument();
    expect(
      screen.getByText("test-project-managers-status")
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Quarterly Reports/i));
    expect(
      screen.getByText("test-project-quarterly-reports-status")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Project Attachments/i));
    expect(
      screen.getByText("test-project-attachments-status")
    ).toBeInTheDocument();
  });

  it("Calls the proper getRoute function when clicking Project Overview", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    fireEvent.click(screen.getByText(/Project Overview/i));
    fireEvent.click(screen.getByText(/Edit project overview/i));

    expect(componentTestingHelper.router.push).toHaveBeenCalledWith(
      "/cif/project-revision/[projectRevision]/form/[formIndex]?projectRevision=test-project-revision-id&formIndex=0",
      "/cif/project-revision/test-project-revision-id/form/0",
      expect.any(Object)
    );
  });

  it("Calls the proper getRoute function when clicking Project Contacts", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    fireEvent.click(screen.getByText(/Project Details/i));
    fireEvent.click(screen.getByText(/Edit project contacts/i));

    expect(componentTestingHelper.router.push).toHaveBeenCalledWith(
      "/cif/project-revision/[projectRevision]/form/[formIndex]?projectRevision=test-project-revision-id&formIndex=2",
      "/cif/project-revision/test-project-revision-id/form/2",
      expect.any(Object)
    );
  });

  it("Calls the proper getRoute function when clicking Project Managers", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    fireEvent.click(screen.getByText(/Project Details/i));
    fireEvent.click(screen.getByText(/Edit project managers/i));

    expect(componentTestingHelper.router.push).toHaveBeenCalledWith(
      "/cif/project-revision/[projectRevision]/form/[formIndex]?projectRevision=test-project-revision-id&formIndex=1",
      "/cif/project-revision/test-project-revision-id/form/1",
      expect.any(Object)
    );
  });

  it("Calls the proper getRoute function when clicking Milestone Reports", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    fireEvent.click(screen.getByText(/Milestone Reports/i));
    fireEvent.click(screen.getByText(/Edit milestone reports/i));

    expect(componentTestingHelper.router.push).toHaveBeenCalledWith(
      "/cif/project-revision/[projectRevision]/form/[formIndex]?projectRevision=test-project-revision-id&formIndex=4",
      "/cif/project-revision/test-project-revision-id/form/4",
      expect.any(Object)
    );
  });

  it("Calls the proper getRoute function when clicking Quarterly Reports", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    fireEvent.click(screen.getByText(/Quarterly Reports/i));
    fireEvent.click(screen.getByText(/Edit quarterly reports/i));
    expect(componentTestingHelper.router.push).toHaveBeenCalledWith(
      "/cif/project-revision/[projectRevision]/form/[formIndex]?projectRevision=test-project-revision-id&formIndex=6",
      "/cif/project-revision/test-project-revision-id/form/6",
      expect.any(Object)
    );
  });

  it("Calls the proper getRoute function when clicking Emissions Intensity Report", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    fireEvent.click(screen.getByText(/Emissions Intensity Report/i));
    fireEvent.click(screen.getByText(/Edit emissions intensity report/i));

    expect(componentTestingHelper.router.push).toHaveBeenCalledWith(
      "/cif/project-revision/[projectRevision]/form/[formIndex]?projectRevision=test-project-revision-id&formIndex=5",
      "/cif/project-revision/test-project-revision-id/form/5",
      expect.any(Object)
    );
  });

  it("Calls the proper getRoute function when clicking Annual Reports", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    fireEvent.click(screen.getByText(/Annual Reports/i));
    fireEvent.click(screen.getByText(/Edit annual reports/i));

    expect(componentTestingHelper.router.push).toHaveBeenCalledWith(
      "/cif/project-revision/[projectRevision]/form/[formIndex]?projectRevision=test-project-revision-id&formIndex=7",
      "/cif/project-revision/test-project-revision-id/form/7",
      expect.any(Object)
    );
  });

  it("Calls the proper getRoute function when clicking Project Attachments", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    fireEvent.click(screen.getByText(/Project Attachments/i));
    fireEvent.click(screen.getByText(/Edit Project Attachments/i));
    expect(componentTestingHelper.router.push).toHaveBeenCalledWith(
      "/cif/project-revision/[projectRevision]/form/[formIndex]?projectRevision=test-project-revision-id&formIndex=8",
      "/cif/project-revision/test-project-revision-id/form/8",
      expect.any(Object)
    );
  });

  it("Renders multiple Milestone items in the taskList", () => {
    const payload = {
      Query() {
        return {
          projectRevision: {
            id: "test-project-revision-id",
            milestoneReportStatuses: {
              edges: [
                {
                  node: {
                    milestoneIndex: 1,
                    formCompletionStatus: "In Progress",
                  },
                },
                {
                  node: {
                    milestoneIndex: 2,
                    formCompletionStatus: "In Progress",
                  },
                },
              ],
            },
          },
        };
      },
    };
    componentTestingHelper.loadQuery(payload);
    componentTestingHelper.renderComponent(undefined, { mode: "view" });
    fireEvent.click(screen.getByText(/Milestone Reports/i));
    expect(screen.getByText("Milestone 1")).toBeInTheDocument();
    expect(screen.getByText("Milestone 2")).toBeInTheDocument();
  });

  it("Renders Milestone due date statuses when viewing the taskList", () => {
    const expectedNow = DateTime.local(2022, 1, 1, 23, 0, 0);
    Settings.now = () => expectedNow.toMillis();
    const payload = {
      Query() {
        return {
          projectRevision: {
            id: "test-project-revision-id",
            milestoneReportStatuses: {
              edges: [
                {
                  node: {
                    milestoneIndex: 1,
                    reportDueDate: "2022-01-15",
                    submittedDate: null,
                    formCompletionStatus: "In Progress",
                  },
                },
                {
                  node: {
                    milestoneIndex: 2,
                    reportDueDate: "2022-04-01",
                    submittedDate: null,
                    formCompletionStatus: "In Progress",
                  },
                },
                {
                  node: {
                    milestoneIndex: 3,
                    reportDueDate: "2022-04-01",
                    submittedDate: "2022-03-01",
                    formCompletionStatus: "In Progress",
                  },
                },
                {
                  node: {
                    milestoneIndex: 3,
                    reportDueDate: "2021-12-12",
                    submittedDate: null,
                    formCompletionStatus: "In Progress",
                  },
                },
              ],
            },
          },
        };
      },
    };
    componentTestingHelper.loadQuery(payload);
    componentTestingHelper.renderComponent(undefined, { mode: "view" });
    fireEvent.click(screen.getByText(/Milestone Reports/i));
    expect(screen.getByText("Due in 14 days")).toBeInTheDocument();
    expect(screen.getByText("Due in 13 weeks")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Late")).toBeInTheDocument();
  });

  it("Calls the route function with the proper anchor when an individual milestone item is clicked", () => {
    const payload = {
      Query() {
        return {
          projectRevision: {
            id: "test-project-revision-id",
            milestoneReportStatuses: {
              edges: [
                {
                  node: {
                    milestoneIndex: 1,
                    formCompletionStatus: null,
                  },
                },
                {
                  node: {
                    milestoneIndex: 2,
                    formCompletionStatus: "In Progress",
                  },
                },
              ],
            },
          },
        };
      },
    };
    componentTestingHelper.loadQuery(payload);
    componentTestingHelper.renderComponent(undefined, { mode: "view" });
    fireEvent.click(screen.getByText(/Milestone Reports/i));
    fireEvent.click(screen.getByText(/Milestone 1/i));

    expect(componentTestingHelper.router.push).toHaveBeenCalledWith(
      "/cif/project-revision/[projectRevision]/form/[formIndex]?projectRevision=test-project-revision-id&formIndex=4#Milestone1",
      "/cif/project-revision/test-project-revision-id/form/4#Milestone1",
      expect.any(Object)
    );
  });

  it("Calls the stageDirtyFormChanges mutation on mount and when the route changes", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent(undefined, {
      mode: "create",
    });
    componentTestingHelper.expectMutationToBeCalled(
      "stageDirtyFormChangesMutation",
      {
        input: {
          projectRevisionId: 42,
        },
      }
    );

    const getMutations = () =>
      componentTestingHelper.environment.mock
        .getAllOperations()
        .filter(
          (op) => op?.fragment?.node?.name === "stageDirtyFormChangesMutation"
        );

    expect(getMutations()).toHaveLength(1);

    // change the route and re-render, the mutation should be called again
    componentTestingHelper.router = {
      ...componentTestingHelper.router,
      pathname: "some-other-path",
    };
    componentTestingHelper.rerenderComponent(undefined, {
      mode: "create",
    });
    expect(getMutations()).toHaveLength(2);

    // rerender without changing the route, should not call the mutation again
    componentTestingHelper.rerenderComponent(undefined, {
      mode: "create",
    });
    expect(getMutations()).toHaveLength(2);
  });

  it("renders sections expanded when they have a form with 'attention required'", () => {
    componentTestingHelper.loadQuery({
      Query() {
        return {
          projectRevision: {
            id: "test-project-revision-id",
            rowId: 42,
            projectFormChange: {
              asProject: {
                fundingStreamRfpByFundingStreamRfpId: {
                  fundingStreamByFundingStreamId: {
                    name: "EP",
                  },
                },
              },
            },
            projectByProjectId: {
              proposalReference: "test-project-proposal-reference",
            },
            projectOverviewStatus: "test-project-overview-status",
            projectContactsStatus: "test-project-contacts-status",
            projectManagersStatus: "Attention Required",
            quarterlyReportsStatus: "test-project-quarterly-reports-status",
            annualReportsStatus: "Attention Required",
          },
        };
      },
    });

    componentTestingHelper.renderComponent(undefined, { mode: "create" });

    expect(screen.queryByText(/add project overview/i)).toBeNull();
    expect(screen.getByText(/add project managers/i)).toBeVisible();
    expect(screen.queryByText(/add quarterly reports/i)).toBeNull();
    expect(screen.getByText(/add annual reports/i)).toBeVisible();
  });

  it("renders EP funding stream task list", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText(/emissions intensity report/i)).toBeVisible();
    expect(screen.getByText(/quarterly reports/i)).toBeVisible();
    expect(screen.getByText(/annual reports/i)).toBeVisible();
    expect(screen.queryByText(/project summary report/i)).toBeNull();
  });

  it("renders IA funding stream task list", () => {
    componentTestingHelper.loadQuery({
      Query() {
        return {
          projectRevision: {
            id: "test-project-revision-id",
            rowId: 42,
            projectFormChange: {
              asProject: {
                fundingStreamRfpByFundingStreamRfpId: {
                  fundingStreamByFundingStreamId: {
                    name: "IA",
                  },
                },
              },
            },
            projectByProjectId: {
              proposalReference: "test-project-proposal-reference",
            },
            projectOverviewStatus: "test-project-overview-status",
            projectContactsStatus: "test-project-contacts-status",
            projectManagersStatus: "test-project-managers-status",
            milestoneReportStatuses: {
              edges: [],
            },
          },
        };
      },
    });

    componentTestingHelper.renderComponent();

    expect(screen.queryByText(/emissions intensity report/i)).toBeNull();
    expect(screen.queryByText(/quarterly reports/i)).toBeNull();
    expect(screen.queryByText(/annual reports/i)).toBeNull();
    expect(screen.getByText(/project summary report/i)).toBeVisible();
  });

  it("does not show any items under `Amendments & Other Revisions` when mode is `view` but route is not `/cif/project-revision/[projectRevision]/view`", () => {
    componentTestingHelper.router.pathname = "a-path";
    componentTestingHelper.loadQuery({
      Query() {
        return {
          projectRevision: {
            id: "test-project-revision-id",
            rowId: 42,
            revisionType: "test-amendment",
            typeRowNumber: 6,
            projectFormChange: {
              asProject: {
                fundingStreamRfpByFundingStreamRfpId: {
                  fundingStreamByFundingStreamId: {
                    name: "EP",
                  },
                },
              },
            },
            projectByProjectId: {
              proposalReference: "test-project-proposal-reference",
            },
            projectOverviewStatus: "test-project-overview-status",
            projectContactsStatus: "test-project-contacts-status",
            projectManagersStatus: "test-project-managers-status",
            quarterlyReportsStatus: "test-project-quarterly-reports-status",
            milestoneReportStatuses: {
              edges: [],
            },
          },
        };
      },
    });
    componentTestingHelper.renderComponent((data) => ({
      projectRevision: data.query.projectRevision,
      mode: "view",
    }));
    expect(screen.queryByText(/test-amendment 6/i)).not.toBeInTheDocument();
  });

  it("shows `View` and the revision name under `Amendments & Other Revisions` when viewing a revision and correctly redirects", () => {
    componentTestingHelper.router.pathname =
      "/cif/project-revision/[projectRevision]/view";
    componentTestingHelper.loadQuery({
      Query() {
        return {
          projectRevision: {
            id: "test-project-revision-id",
            rowId: 42,
            revisionType: "test-amendment",
            typeRowNumber: 6,
            projectFormChange: {
              asProject: {
                fundingStreamRfpByFundingStreamRfpId: {
                  fundingStreamByFundingStreamId: {
                    name: "EP",
                  },
                },
              },
            },
            projectByProjectId: {
              proposalReference: "test-project-proposal-reference",
            },
            projectOverviewStatus: "test-project-overview-status",
            projectContactsStatus: "test-project-contacts-status",
            projectManagersStatus: "test-project-managers-status",
            quarterlyReportsStatus: "test-project-quarterly-reports-status",
            milestoneReportStatuses: {
              edges: [],
            },
          },
        };
      },
    });
    componentTestingHelper.renderComponent((data) => ({
      projectRevision: data.query.projectRevision,
      mode: "view",
      projectRevisionUnderReview: {
        id: "proj-rev-under-review-id",
        revisionType: "test-general-rev",
        typeRowNumber: 99,
      },
    }));

    expect(screen.getByText(/view test-general-rev 99/i)).toBeInTheDocument();
    userEvent.click(screen.getByText(/view test-general-rev 99/i));

    expect(componentTestingHelper.router.push).toHaveBeenCalledWith(
      "/cif/project-revision/[projectRevision]/view?projectRevision=proj-rev-under-review-id",
      "/cif/project-revision/proj-rev-under-review-id/view",
      expect.any(Object)
    );
  });

  it("shows `Edit` and the revision name under `Amendments & Other Revisions` when Edit a revision and correctly redirects", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    expect(screen.getByText(/edit test-amendment 6/i)).toBeInTheDocument();

    userEvent.click(screen.getByText(/edit test-amendment 6/i));

    expect(componentTestingHelper.router.push).toHaveBeenCalledWith(
      "/cif/project-revision/[projectRevision]/edit?projectRevision=test-project-revision-id",
      "/cif/project-revision/test-project-revision-id/edit",
      expect.any(Object)
    );
  });

  it("shows `New Revision` under `Amendments & Other Revisions` when on create route and does not redirect", () => {
    componentTestingHelper.router.pathname =
      "/cif/project-revision/[projectRevision]/create";
    componentTestingHelper.loadQuery({
      Query() {
        return {
          projectRevision: {
            id: "test-project-revision-id",
            rowId: 42,
            revisionType: "test-amendment",
            typeRowNumber: 6,
            projectFormChange: {
              asProject: {
                fundingStreamRfpByFundingStreamRfpId: {
                  fundingStreamByFundingStreamId: {
                    name: "EP",
                  },
                },
              },
            },
            projectByProjectId: {
              proposalReference: "test-project-proposal-reference",
            },
            projectOverviewStatus: "test-project-overview-status",
            projectContactsStatus: "test-project-contacts-status",
            projectManagersStatus: "test-project-managers-status",
            quarterlyReportsStatus: "test-project-quarterly-reports-status",
            milestoneReportStatuses: {
              edges: [],
            },
          },
        };
      },
    });
    componentTestingHelper.renderComponent((data) => ({
      projectRevision: data.query.projectRevision,
      mode: "view",
      projectRevisionUnderReview: data.query.projectRevision,
    }));
    expect(screen.getByText(/new revision/i)).toBeInTheDocument();
    userEvent.click(screen.getByText(/new revision/i));

    expect(componentTestingHelper.router.push).not.toHaveBeenCalled();
  });
});
