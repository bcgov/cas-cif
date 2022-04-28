import { screen } from "@testing-library/react";
import DefaultLayout from "components/Layout/DefaultLayout";
import { mocked } from "jest-mock";
import { useRouter } from "next/router";
import { graphql } from "relay-runtime";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledDefaultLayoutTestQuery, {
  DefaultLayoutTestQuery,
} from "__generated__/DefaultLayoutTestQuery.graphql";
jest.mock("next/router");
mocked(useRouter).mockReturnValue({ query: {} } as any);

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

  it("should not render the subheader links if the user is logged out", () => {
    componentTestingHelper.loadQuery({
      Query() {
        return { session: null };
      },
    });
    componentTestingHelper.renderComponent();
    expect(screen.getByText("CleanBC Industry Fund")).toBeVisible();
    expect(screen.queryByText("Dashboard")).toBeNull();
    expect(screen.queryByText("Projects")).toBeNull();
  });

  it("should render the subheader links if the user is logged in", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText("Dashboard")).toBeVisible();
    expect(screen.getByText("Projects")).toBeVisible();
  });

  it("should render the Dashboard link to /cif", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText("Dashboard").closest("a")).toHaveAttribute(
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
});
