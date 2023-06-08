import { screen } from "@testing-library/react";
import DefaultLayout from "components/Layout/DefaultLayout";
import { graphql } from "relay-runtime";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledDefaultLayoutTestQuery, {
  DefaultLayoutTestQuery,
} from "__generated__/DefaultLayoutTestQuery.graphql";

const testQuery = graphql`
  query DefaultLayoutTestQuery @relay_test_operation {
    query {
      session {
        ...DefaultLayout_session
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
  new ComponentTestingHelper<DefaultLayoutTestQuery>({
    component: DefaultLayout,
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
  });

  it("should render the Home link to /cif", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText("Home").closest("a")).toHaveAttribute(
      "href",
      "/cif"
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

  it("should render Navigation and Footer components", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText("Home")).toBeVisible(); // Navigation
    expect(screen.getByText("Projects")).toBeVisible(); // Navigation
    expect(screen.getByText("Disclaimer")).toBeInTheDocument(); // Footer
  });
});
