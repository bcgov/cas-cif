import { render, screen, act, fireEvent } from "@testing-library/react";
import Table from "components/Table";
import { DisplayOnlyFilter, TextFilter } from "components/Table/Filters";
import { useRouter } from "next/router";
import { mocked } from "jest-mock";
jest.mock("next/router");

const routerPush = jest.fn();
mocked(useRouter).mockReturnValue({
  pathname: "/",
  query: {},
  push: routerPush,
} as any);

describe("The Table Component", () => {
  it("renders the provided columns and rows", () => {
    render(
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
    );

    ["col A", "col B", "A 1", "B 1", "A 2", "B 2"].forEach((text) =>
      expect(screen.getByText(text)).toBeInTheDocument()
    );
  });

  it("renders the provided empty state contents when there are no rows", () => {
    render(
      <Table
        filters={[
          new DisplayOnlyFilter("col A"),
          new DisplayOnlyFilter("col B"),
        ]}
        emptyStateContents="nothing to see here"
      />
    );

    expect(screen.getByText("nothing to see here")).toBeInTheDocument();
  });

  it("updates the query string when pagination component changes pages", () => {
    render(
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
});
