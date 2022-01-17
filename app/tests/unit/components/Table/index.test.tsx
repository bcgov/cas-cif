import { render, screen } from "@testing-library/react";
import Table from "components/Table";

describe("The Table Component", () => {
  it("renders the provided columns and rows", () => {
    render(
      <Table filters={[{ title: "col A" }, { title: "col B" }]}>
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
        filters={[{ title: "col A" }, { title: "col B" }]}
        emptyStateContents="nothing to see here"
      />
    );

    expect(screen.getByText("nothing to see here")).toBeInTheDocument();
  });
});
