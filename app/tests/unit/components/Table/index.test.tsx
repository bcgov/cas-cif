/* eslint-disable relay/graphql-naming */
// eslint and the relay compiler are conflicting here.
import { render, screen, act, fireEvent } from "@testing-library/react";
import Table from "components/Table";
import { DisplayOnlyFilter, TextFilter } from "components/Table/Filters";
import { useRouter } from "next/router";
import { mocked } from "jest-mock";
import { graphql } from "relay-runtime";
import { RelayEnvironmentProvider } from "react-relay";
import { createMockEnvironment } from "relay-test-utils";
jest.mock("next/router");

const routerPush = jest.fn();
mocked(useRouter).mockReturnValue({
  pathname: "/",
  query: {},
  push: routerPush,
} as any);

const pageQuery = graphql`
  query TableQuery @relay_test_operation {
    query {
      __typename
    }
  }
`;

let environment;

describe("The Table Component", () => {
  beforeEach(() => {
    environment = createMockEnvironment();
  });

  it("renders the provided columns and rows", () => {
    render(
      <RelayEnvironmentProvider environment={environment}>
        <Table
          filters={[
            new DisplayOnlyFilter("col A"),
            new DisplayOnlyFilter("col B"),
          ]}
        >
          <tr>
            <td>A 1</td>
            <td>B 1</td>
          </tr>
          <tr>
            <td>A 2</td>
            <td>B 2</td>
          </tr>
        </Table>
      </RelayEnvironmentProvider>
    );

    ["col A", "col B", "A 1", "B 1", "A 2", "B 2"].forEach((text) =>
      expect(screen.getByText(text)).toBeInTheDocument()
    );
  });

  it("renders the provided empty state contents when there are no rows", () => {
    render(
      <RelayEnvironmentProvider environment={environment}>
        <Table
          filters={[
            new DisplayOnlyFilter("col A"),
            new DisplayOnlyFilter("col B"),
          ]}
          emptyStateContents="nothing to see here"
        />
      </RelayEnvironmentProvider>
    );

    expect(screen.getByText("nothing to see here")).toBeInTheDocument();
  });

  it("updates the query string when pagination component changes pages", () => {
    render(
      <RelayEnvironmentProvider environment={environment}>
        <Table
          filters={[
            new DisplayOnlyFilter("col A"),
            new DisplayOnlyFilter("col B"),
          ]}
          paginated
          totalRowCount={50}
        >
          {new Array(50).map((_, index) => (
            <tr key={index}>
              <td>A 1</td>
              <td>B 1</td>
            </tr>
          ))}
        </Table>
      </RelayEnvironmentProvider>
    );

    fireEvent.click(screen.getByTitle(/go to next page/i));

    const expectedRoute = {
      pathname: "/",
      query: {
        pageArgs: JSON.stringify({ offset: 20 }),
      },
    };

    expect(routerPush).toHaveBeenCalledWith(expectedRoute, expectedRoute, {
      shallow: true,
    });
  });

  it("updates the query string when a filter is applied", () => {
    render(
      <RelayEnvironmentProvider environment={environment}>
        <Table
          filters={[
            new TextFilter("col A", "colA"),
            new DisplayOnlyFilter("col B"),
          ]}
        >
          {new Array(50).map((_, index) => (
            <tr key={index}>
              <td>A 1</td>
              <td>B 1</td>
            </tr>
          ))}
        </Table>
      </RelayEnvironmentProvider>
    );

    act(() => {
      fireEvent.change(screen.getByPlaceholderText(/filter/i), {
        target: { value: "A" },
      });
    });
    fireEvent.click(screen.getByText(/apply/i));

    const expectedRoute = {
      pathname: "/",
      query: {
        filterArgs: JSON.stringify({ colA: "A" }),
        pageArgs: JSON.stringify({ offset: 0 }),
      },
    };

    expect(routerPush).toHaveBeenCalledWith(expectedRoute, expectedRoute, {
      shallow: true,
    });
  });

  it("when given a pageQuery prop, pre-fetches the query with the new variables", () => {
    render(
      <RelayEnvironmentProvider environment={environment}>
        <Table
          pageQuery={pageQuery}
          filters={[
            new TextFilter("col A", "colA"),
            new DisplayOnlyFilter("col B"),
          ]}
        >
          {new Array(50).map((_, index) => (
            <tr key={index}>
              <td>A 1</td>
              <td>B 1</td>
            </tr>
          ))}
        </Table>
      </RelayEnvironmentProvider>
    );

    act(() => {
      fireEvent.change(screen.getByPlaceholderText(/filter/i), {
        target: { value: "A" },
      });
    });
    fireEvent.click(screen.getByText(/apply/i));

    expect(screen.getByPlaceholderText(/filter/i)).toBeDisabled();
    expect(screen.getByText(/apply/i)).toBeDisabled();

    expect(routerPush).not.toHaveBeenCalled();
    act(() => {
      environment.mock.resolveMostRecentOperation(() => ({
        data: { query: { id: "abc", __typename: "Query" } },
      }));
    });

    expect(screen.getByPlaceholderText(/filter/i)).toBeEnabled();
    expect(screen.getByText(/apply/i)).toBeEnabled();

    const expectedRoute = {
      pathname: "/",
      query: {
        filterArgs: JSON.stringify({ colA: "A" }),
        pageArgs: JSON.stringify({ offset: 0 }),
      },
    };

    expect(routerPush).toHaveBeenCalledWith(expectedRoute, expectedRoute, {
      shallow: true,
    });
  });
});
