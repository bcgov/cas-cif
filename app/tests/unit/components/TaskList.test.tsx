import { fireEvent, screen } from "@testing-library/react";
import TaskList from "components/TaskList";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledTaskListQuery, {
  TaskListQuery,
} from "__generated__/TaskListQuery.graphql";
import { mocked } from "jest-mock";
import { useRouter } from "next/router";

jest.mock("next/dist/client/router");
const mockPush = jest.fn();
mocked(useRouter).mockImplementation(() => {
  return {
    push: mockPush,
  } as any;
});

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
});

describe("The ProjectManagerForm", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    componentTestingHelper.reinit();
  });

  it("Renders the TaskList In edit mode when projectByProjectId is not null", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    expect(
      screen.getByText("Editing: test-project-proposal-reference")
    ).toBeInTheDocument();
  });

  it("Renders the TaskList In create mode when projectByProjectId is null", () => {
    componentTestingHelper.loadQuery({
      Query() {
        return {
          projectRevision: {
            projectByProjectId: null,
          },
        };
      },
    });
    componentTestingHelper.renderComponent();
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
    expect(
      screen.getByText("test-project-quarterly-reports-status")
    ).toBeInTheDocument();
  });

  it("Calls the proper getRoute function when clicking Project Overview", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    fireEvent.click(screen.getByText(/Project Overview/i));
    fireEvent.click(screen.getByText(/Edit project overview/i));

    expect(mockPush).toHaveBeenCalledWith(
      "/cif/project-revision/[projectRevision]/form/overview?projectRevision=test-project-revision-id",
      "/cif/project-revision/test-project-revision-id/form/overview",
      expect.any(Object)
    );
  });

  it("Calls the proper getRoute function when clicking Project Contacts", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    fireEvent.click(screen.getByText(/Project Details/i));
    fireEvent.click(screen.getByText(/Edit project contacts/i));

    expect(mockPush).toHaveBeenCalledWith(
      "/cif/project-revision/[projectRevision]/form/contacts?projectRevision=test-project-revision-id",
      "/cif/project-revision/test-project-revision-id/form/contacts",
      expect.any(Object)
    );
  });

  it("Calls the proper getRoute function when clicking Project Managers", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    fireEvent.click(screen.getByText(/Project Details/i));
    fireEvent.click(screen.getByText(/Edit project managers/i));

    expect(mockPush).toHaveBeenCalledWith(
      "/cif/project-revision/[projectRevision]/form/managers?projectRevision=test-project-revision-id",
      "/cif/project-revision/test-project-revision-id/form/managers",
      expect.any(Object)
    );
  });

  it("Calls the proper getRoute function when clicking Quarterly Reports", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    fireEvent.click(screen.getByText(/Edit quarterly reports/i));

    expect(mockPush).toHaveBeenCalledWith(
      "/cif/project-revision/[projectRevision]/form/quarterly-reports?projectRevision=test-project-revision-id",
      "/cif/project-revision/test-project-revision-id/form/quarterly-reports",
      expect.any(Object)
    );
  });
});
