import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dashboard from "components/Dashboard";
import { mocked } from "jest-mock";
import getConfig from "next/config";
import { graphql } from "react-relay";
import { getNewProjectRevisionPageRoute } from "routes/pageRoutes";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledDashboardTestQuery, {
  DashboardTestQuery,
} from "__generated__/DashboardTestQuery.graphql";
jest.mock("next/config");

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

// mocking the getConfig function to return a mocked config object to be used in `getSupportEmailMailTo` function
mocked(getConfig).mockImplementation(() => ({
  publicRuntimeConfig: {
    SUPPORT_EMAIL: "test@email.com",
  },
}));

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

  it("Redirects when the user clicks the create project button", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    act(() => userEvent.click(screen.getByText(/Create a new Project/i)));

    expect(componentTestingHelper.router.push).toHaveBeenCalledWith(
      getNewProjectRevisionPageRoute()
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
      "/cif/project-revision/mock-id-1/form/0"
    );
  });
  it("Shows dashboard links with admin privileges", () => {
    const customQueryPayload = {
      Query() {
        return {
          session: {
            cifUserBySub: {
              givenName: "Bob the Admin",
            },
            userGroups: ["cif_admin"],
          },
          pendingNewProjectRevision: null,
        };
      },
    };
    componentTestingHelper.loadQuery(customQueryPayload);
    componentTestingHelper.renderComponent();

    expect(screen.getByText(/Welcome, Bob the Admin/i)).toBeVisible();
    expect(
      screen.getByRole("heading", {
        name: /projects/i,
      })
    ).toBeVisible();
    expect(screen.getByText("Create, view and manage projects")).toBeVisible();
    expect(screen.getByText(/Projects List/i)).toHaveAttribute(
      "href",
      "/cif/projects"
    );
    expect(screen.getByText(/Create a new Project/i)).toBeVisible();
    expect(screen.getByText(/Reporting Operations/i)).toBeVisible();
    expect(screen.getByText("Create, manage and search")).toBeVisible();
    expect(screen.getByText(/Operators/i)).toHaveAttribute(
      "href",
      "/cif/operators"
    );
    expect(screen.getByText(/Contacts/i)).toHaveAttribute(
      "href",
      "/cif/contacts"
    );
    expect(screen.getByText(/Administration/i)).toBeVisible();
    expect(
      screen.getByRole("link", {
        name: /data insights \(metabase\)/i,
      })
    ).toHaveAttribute("href", "https://cas-metabase.nrs.gov.bc.ca/");
    expect(
      screen.getByRole("link", {
        name: /report a problem/i,
      })
    ).toHaveAttribute(
      "href",
      "mailto:test@email.com?subject=CIF App: Report a problem!"
    );
  });
  it("Doesn't show admin links for non-admin users", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    expect(screen.queryByText(/Administration/i)).toBeNull();
    expect(screen.queryByText(/data insights \(metabase\)/i)).toBeNull();
    expect(screen.queryByText(/report a problem/i)).toBeNull();
  });
});
