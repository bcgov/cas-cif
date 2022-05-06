import { fireEvent, screen } from "@testing-library/react";
import TaskList from "components/TaskList";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledTaskListQuery, {
  TaskListQuery,
} from "__generated__/TaskListQuery.graphql";
import * as pageRoutes from "pageRoutes";

jest.mock("next/link", () => {
  return ({ children }) => {
    return children;
  };
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
            id: "test-project-revision-id",
            projectByProjectId: null,
            projectOverviewStatus: "test-project-overview-status",
            projectContactsStatus: "test-project-contacts-status",
            projectManagersStatus: "test-project-managers-status",
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
    expect(
      screen.getByText("test-project-overview-status")
    ).toBeInTheDocument();
    expect(
      screen.getByText("test-project-contacts-status")
    ).toBeInTheDocument();
    expect(
      screen.getByText("test-project-managers-status")
    ).toBeInTheDocument();
  });

  it("Calls the proper getRoute function when clicking Project Overview", () => {
    const mockGetData = jest
      .spyOn(pageRoutes, "getProjectRevisionOverviewFormPageRoute")
      .mockImplementation((id) => ({
        pathname: `/cif/project-revision/[projectRevision]/form/overview/`,
        query: {
          projectRevision: id,
        },
      }));
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    fireEvent.click(screen.getByText(/Edit project overview/i));

    expect(mockGetData).toHaveBeenCalledWith("test-project-revision-id");
  });

  it("Calls the proper getRoute function when clicking Project Contacts", () => {
    const mockGetData = jest
      .spyOn(pageRoutes, "getProjectRevisionContactsFormPageRoute")
      .mockImplementation((id) => ({
        pathname: `/cif/project-revision/[projectRevision]/form/contacts/`,
        query: {
          projectRevision: id,
        },
      }));
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    fireEvent.click(screen.getByText(/Edit project contacts/i));

    expect(mockGetData).toHaveBeenCalledWith("test-project-revision-id");
  });

  it("Calls the proper getRoute function when clicking Project Managers", () => {
    const mockGetData = jest
      .spyOn(pageRoutes, "getProjectRevisionManagersFormPageRoute")
      .mockImplementation((id) => ({
        pathname: `/cif/project-revision/[projectRevision]/form/managers/`,
        query: {
          projectRevision: id,
        },
      }));
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    fireEvent.click(screen.getByText(/Edit project managers/i));

    expect(mockGetData).toHaveBeenCalledWith("test-project-revision-id");
  });
});
