import { fireEvent, screen } from "@testing-library/react";
import TaskList from "components/TaskList";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledTaskListQuery, {
  TaskListQuery,
} from "__generated__/TaskListQuery.graphql";

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
        projectByProjectId: {
          proposalReference: "test-project-proposal-reference",
        },
        projectOverviewStatus: "test-project-overview-status",
        projectContactsStatus: "test-project-contacts-status",
        projectManagersStatus: "test-project-managers-status",
        quarterlyReportsStatus: "test-project-quarterly-reports-status",
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
  }),
  defaultQueryResolver: mockQueryPayload,
  defaultQueryVariables: { projectRevision: "Test Revision ID" },
  defaultComponentProps: { mode: "update" },
});

describe("The ProjectManagerForm", () => {
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

  it("Calls the proper getRoute function when clicking Quarterly Reports", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    fireEvent.click(screen.getByText(/Quarterly Reports/i));
    fireEvent.click(screen.getByText(/Edit quarterly reports/i));

    expect(componentTestingHelper.router.push).toHaveBeenCalledWith(
      "/cif/project-revision/[projectRevision]/form/[formIndex]?projectRevision=test-project-revision-id&formIndex=3",
      "/cif/project-revision/test-project-revision-id/form/3",
      expect.any(Object)
    );
  });
});
