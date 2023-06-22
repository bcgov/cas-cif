import { screen } from "@testing-library/react";
import ExternalLayout from "components/Layout/ExternalLayout";
import { graphql } from "relay-runtime";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledDefaultLayoutTestQuery, {
  ExternalLayoutTestQuery,
} from "__generated__/ExternalLayoutTestQuery.graphql";

const testQuery = graphql`
  query ExternalLayoutTestQuery @relay_test_operation {
    query {
      session {
        ...ExternalLayout_session
      }
    }
  }
`;

const mockQueryPayload = {
  KeycloakJwt() {
    return {
      cifUserBySub: {
        id: "1",
      },
      userGroups: ["cif_admin"],
    };
  },
};

const defaultComponentProps = {};

const componentTestingHelper =
  new ComponentTestingHelper<ExternalLayoutTestQuery>({
    component: ExternalLayout,
    testQuery: testQuery,
    compiledQuery: compiledDefaultLayoutTestQuery,
    getPropsFromTestQuery: (data) => ({
      session: data.query.session,
    }),
    defaultQueryResolver: mockQueryPayload,
    defaultQueryVariables: {},
    defaultComponentProps: defaultComponentProps,
  });

describe("The DefaultLayout component", () => {
  beforeEach(() => {
    componentTestingHelper.reinit();
    jest.spyOn(require("next/router"), "useRouter").mockImplementation(() => {
      return { pathname: "/cif-external", query: testQuery };
    });
  });

  it("should not render the subheader links if the user is logged out", () => {
    componentTestingHelper.loadQuery({
      Query() {
        return { session: null };
      },
    });
    componentTestingHelper.renderComponent();
    expect(screen.getByText("CleanBC Industry Fund")).toBeVisible();
    expect(screen.queryByText("Home")).toBeNull();
    expect(screen.queryByText("Email Us")).toBeNull();
    expect(screen.queryByText("Contact Information")).toBeNull();
  });

  it("should render the subheader links if the user is logged in", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText("Home")).toBeVisible();
    expect(screen.getByText("Email Us")).toBeVisible();
    expect(screen.getByText("Contact Information")).toBeVisible();
  });

  it("should render the Home link to /cif-external", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText("Home").closest("a")).toHaveAttribute(
      "href",
      "/cif-external"
    );
  });

  it("should render the `leftSideNav` prop into a `nav` element", () => {
    componentTestingHelper.loadQuery({
      Query() {
        return { session: null };
      },
    });

    const leftSideNav = (
      <div>
        <h2>left side nav</h2>
      </div>
    );

    componentTestingHelper.renderComponent(undefined, {
      ...defaultComponentProps,
      leftSideNav,
    });
    expect(screen.getByText("left side nav")).toBeVisible();
    expect(
      screen.getByRole("navigation", { name: "side navigation" })
    ).toBeVisible();
  });

  it("should render the correct footer links", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText("Home")).toBeVisible();
    expect(screen.getByText("Program Details")).toBeVisible();
    expect(screen.getByText("Disclaimer")).toBeVisible();
    expect(screen.getByText("Privacy")).toBeVisible();
    expect(screen.getByText("Accessibility")).toBeVisible();
    expect(screen.getByText("Copyright")).toBeVisible();
  });
});
