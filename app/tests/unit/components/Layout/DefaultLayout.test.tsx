import DefaultLayout from "components/Layout/DefaultLayout";
import { render, screen } from "@testing-library/react";
import { graphql } from "relay-runtime";
import { RelayEnvironmentProvider, useLazyLoadQuery } from "react-relay";
import compiledDefaultLayoutTestQuery, {
  DefaultLayoutTestQuery,
} from "__generated__/DefaultLayoutTestQuery.graphql";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { useRouter } from "next/router";
import { mocked } from "jest-mock";
jest.mock("next/router");
mocked(useRouter).mockReturnValue({ query: {} } as any);

let environment;
const TestRenderer = (props) => {
  const data = useLazyLoadQuery<DefaultLayoutTestQuery>(
    graphql`
      query DefaultLayoutTestQuery @relay_test_operation {
        query {
          session {
            ...DefaultLayout_session
          }
        }
      }
    `,
    {}
  );
  return <DefaultLayout session={data.query.session} {...props} />;
};

const resolveQuery = (mockResolvers) => {
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, mockResolvers)
  );
  environment.mock.queuePendingOperation(compiledDefaultLayoutTestQuery, {});
};

const renderDefaultLayout = (props?) => {
  return render(
    <RelayEnvironmentProvider environment={environment}>
      <TestRenderer {...props} />
    </RelayEnvironmentProvider>
  );
};

describe("The DefaultLayout component", () => {
  beforeEach(() => {
    environment = createMockEnvironment();
  });

  it("should not render the subheader links if the user is logged out", () => {
    resolveQuery({
      Query() {
        return { session: null };
      },
    });
    renderDefaultLayout();
    expect(screen.getByText("CleanBC Industry Fund")).toBeVisible();
    expect(screen.queryByText("Dashboard")).toBeNull();
    expect(screen.queryByText("Projects")).toBeNull();
  });

  it("should render the subheader links if the user is logged in", () => {
    resolveQuery({
      KeycloakJwt() {
        return {
          cifUserBySub: {
            id: "1",
          },
          userGroups: [],
        };
      },
    });
    renderDefaultLayout();

    expect(screen.getByText("Dashboard")).toBeVisible();
    expect(screen.getByText("Projects")).toBeVisible();
  });

  it("should render the Dashboard link to /cif", () => {
    resolveQuery({
      KeycloakJwt() {
        return {
          cifUserBySub: {
            id: "1",
          },
          userGroups: ["cif_admin"],
        };
      },
    });
    renderDefaultLayout();

    expect(screen.getByText("Dashboard").closest("a")).toHaveAttribute(
      "href",
      "/cif"
    );
  });

  it("should render the `leftSideNav` prop into a `nav` element", () => {
    resolveQuery({
      Query() {
        return { session: null };
      },
    });
    const leftSideNav = (
      <div>
        <h2>left side nav</h2>
      </div>
    );
    renderDefaultLayout({ leftSideNav });
    expect(screen.getByText("left side nav")).toBeVisible();
    expect(
      screen.getByRole("navigation", { name: "side navigation" })
    ).toBeVisible();
  });
});
