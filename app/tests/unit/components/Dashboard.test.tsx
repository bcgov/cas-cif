import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dashboard from "components/Dashboard";
import { graphql } from "react-relay";
import { MockPayloadGenerator } from "relay-test-utils";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledDashboardTestQuery, {
  DashboardTestQuery,
} from "__generated__/DashboardTestQuery.graphql";

const testQuery = graphql`
  query DashboardTestQuery @relay_test_operation {
    ...Dashboard_query
  }
`;

const mockQueryPayload = {
  Query() {
    return {
      session: {
        cifUserBySub: {
          givenName: "Bob",
        },
        userGroups: ["cif_internal"],
      },
      pendingNewProjectRevision: null,
    };
  },
};

const componentTestingHelper = new ComponentTestingHelper<DashboardTestQuery>({
  component: Dashboard,
  testQuery: testQuery,
  compiledQuery: compiledDashboardTestQuery,
  getPropsFromTestQuery: (data) => ({
    query: data,
  }),
  defaultQueryResolver: mockQueryPayload,
  defaultQueryVariables: {},
  defaultComponentProps: {},
});

describe("The Dashboard", () => {
  beforeEach(() => {
    componentTestingHelper.reinit();
  });

  it("Shows the user's first name in the welcome message", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    expect(screen.getByText(/Welcome, Bob/i)).toBeVisible();
    expect(screen.getByText(/Create a new Project/i)).toBeVisible();
  });

  it("Triggers the createProjectMutation and redirects when the user clicks the create project button", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    act(() => userEvent.click(screen.getByText(/Create a new Project/i)));
    expect(screen.getByText(/Create a new Project/i)).toBeDisabled();

    const operation =
      componentTestingHelper.environment.mock.getMostRecentOperation();
    expect(operation.fragment.node.name).toBe("createProjectMutation");
    act(() => {
      componentTestingHelper.environment.mock.resolve(
        operation,
        MockPayloadGenerator.generate(operation)
      );
    });
    expect(componentTestingHelper.router.push).toHaveBeenCalledWith({
      pathname: "/cif/project-revision/[projectRevision]/form/overview/",
      query: { projectRevision: "<ProjectRevision-mock-id-1>" },
    });
  });

  it("calls useMutationWithErrorMessage and returns expected message when the user clicks the create project button and there's a mutation error", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    const spy = jest.spyOn(
      require("app/mutations/useMutationWithErrorMessage"),
      "default"
    );
    userEvent.click(screen.getByText(/Create a new Project/i));
    act(() => {
      componentTestingHelper.environment.mock.rejectMostRecentOperation(
        new Error()
      );
    });
    const getErrorMessage = spy.mock.calls[0][1] as Function;

    expect(getErrorMessage()).toBe(
      "An error occurred when creating a project."
    );
  });

  it("The resume project link to be displayed when a pending new project exists", () => {
    componentTestingHelper.loadQuery({
      Query() {
        return {
          session: {
            cifUserBySub: {
              firstName: "Bob",
            },
            userGroups: ["cif_internal"],
          },
          pendingNewProjectRevision: { id: "mock-id-1" },
        };
      },
    });
    componentTestingHelper.renderComponent();
    expect(screen.getByText(/resume project/i).closest("a")).toHaveAttribute(
      "href",
      "/cif/project-revision/mock-id-1/form/overview"
    );
  });
});
