import { useRouter } from "next/router";
import { mocked } from "jest-mock";
import React from "react";
import SortableHeader from "components/Table/SortableHeader";
import { render, screen } from "@testing-library/react";
jest.mock("next/router");

mocked(useRouter).mockReturnValue({
  route: "/",
  query: {},
} as any);

describe("The sortable table header", () => {
  it("displays the sort direction arrows if sortable is true", () => {
    render(
      <table>
        <thead>
          <SortableHeader
            sortable
            orderByPrefix="TEST_COLUMN"
            displayName="testdisplay"
          />
        </thead>
      </table>
    );

    expect(
      screen.getByText("testdisplay").querySelector("svg")
    ).toHaveAttribute("data-icon", "sort");
  });

  it("doesnt display the sort direction arrows if sortable is false", () => {
    render(
      <table>
        <thead>
          <SortableHeader displayName="testdisplay" />
        </thead>
      </table>
    );

    expect(screen.getByText("testdisplay").querySelector("svg")).toBeNull();
  });

  it("gets the sort direction from the router", () => {
    mocked(useRouter).mockReturnValue({
      route: "/",
      query: { orderBy: "TEST_COLUMN_ASC" },
    } as any);

    render(
      <table>
        <thead>
          <SortableHeader
            sortable
            orderByPrefix="TEST_COLUMN"
            displayName="testdisplay"
          />
        </thead>
      </table>
    );

    expect(screen.getByText("testdisplay")).toHaveAttribute(
      "aria-sort",
      "ascending"
    );
    expect(
      screen.getByText("testdisplay").querySelector("svg")
    ).toHaveAttribute("data-icon", "caret-down");
  });
});
