import Dashboard from "components/Dashboard";
import { useRouter } from "next/router";
import { mocked } from "jest-mock";
import compiledDashboardTestQuery, {
  DashboardTestQuery,
} from "__generated__/DashboardTestQuery.graphql";
import {
  useLazyLoadQuery,
  graphql,
  RelayEnvironmentProvider,
} from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("next/router");

const routerPush = jest.fn();

mocked(useRouter).mockReturnValue({ push: routerPush } as any);

let environment;
const TestRenderer = () => {
  const data = useLazyLoadQuery<DashboardTestQuery>(
    graphql`
      query DashboardTestQuery @relay_test_operation {
        ...Dashboard_query
      }
    `,
    {}
  );
  return <Dashboard query={data} />;
};

const resolveQuery = (mockResolvers) => {
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, mockResolvers)
  );
  environment.mock.queuePendingOperation(compiledDashboardTestQuery, {});
};

const renderDashboard = () => {
  return render(
    <RelayEnvironmentProvider environment={environment}>
      <TestRenderer />
    </RelayEnvironmentProvider>
  );
};

describe("The Dashboard", () => {
  beforeEach(() => {
    environment = createMockEnvironment();
  });

  it("Shows the user's first name in the welcome message", () => {
    resolveQuery({
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
    });
    renderDashboard();
    expect(screen.getByText(/Welcome, Bob/i)).toBeVisible();
    expect(screen.getByText(/Create a new Project/i)).toBeVisible();
  });

  it("Triggers the createProjectMutation and redirects when the user clicks the create project button", () => {
    resolveQuery({
      Query() {
        return {
          session: {
            cifUserBySub: {
              firstName: "Bob",
            },
            userGroups: ["cif_internal"],
          },
          pendingNewProjectRevision: null,
        };
      },
    });
    renderDashboard();

    act(() => userEvent.click(screen.getByText(/Create a new Project/i)));
    expect(screen.getByText(/Create a new Project/i)).toBeDisabled();

    const operation = environment.mock.getMostRecentOperation();
    expect(operation.fragment.node.name).toBe("createProjectMutation");
    act(() => {
      environment.mock.resolve(
        operation,
        MockPayloadGenerator.generate(operation)
      );
    });
    expect(routerPush).toHaveBeenCalledWith({
      pathname: "/cif/project-revision/[projectRevision]/form/overview/",
      query: { projectRevision: "<ProjectRevision-mock-id-1>" },
    });
  });

  it("calls useMutationWithErrorMessage and returns expected message when the user clicks the create project button and there's a mutation error", () => {
    resolveQuery({
      Query() {
        return {
          session: {
            cifUserBySub: {
              firstName: "Bob",
            },
            userGroups: ["cif_internal"],
          },
          pendingNewProjectRevision: null,
        };
      },
    });
    renderDashboard();
    const spy = jest.spyOn(
      require("app/mutations/useMutationWithErrorMessage"),
      "default"
    );
    userEvent.click(screen.getByText(/Create a new Project/i));
    act(() => {
      environment.mock.rejectMostRecentOperation(new Error());
    });
    const getErrorMessage = spy.mock.calls[0][1] as Function;

    expect(getErrorMessage()).toBe(
      "An error occurred when creating a project."
    );
  });

  it("The resume project link to be displayed when a pending new project exists", () => {
    resolveQuery({
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
    renderDashboard();
    expect(screen.getByText(/resume project/i).closest("a")).toHaveAttribute(
      "href",
      "/cif/project-revision/mock-id-1/form/overview"
    );
  });
});
