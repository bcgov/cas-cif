import { render, screen } from "@testing-library/react";
import Table from "components/Table";
import { DisplayOnlyFilter } from "components/Table/Filters";
import { useRouter } from "next/router";
import { mocked } from "jest-mock";
jest.mock("next/router");

mocked(useRouter).mockReturnValue({
  route: "/",
  query: {},
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
});
