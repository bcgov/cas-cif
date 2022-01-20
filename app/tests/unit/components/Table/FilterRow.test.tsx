import React from "react";
import FilterRow from "components/Table/FilterRow";
import { act, fireEvent, render, screen } from "@testing-library/react";
import {
  SortOnlyFilter,
  TableFilter,
  TextFilter,
} from "components/Table/Filters";

describe("The filterable table headers component", () => {
  it("renders search and reset buttons", () => {
    render(
      <table>
        <thead>
          <FilterRow
            filters={[new TextFilter("test", "test")]}
            onSubmit={jest.fn()}
            filterArgs={{}}
          />
        </thead>
      </table>
    );
    expect(screen.getByText(/clear/i)).toBeInTheDocument();
    expect(screen.getByText(/apply/i)).toBeInTheDocument();
  });

  it("renders as many td elements as search options", () => {
    const filters: TableFilter[] = [
      new TextFilter("test", "test"),
      new TextFilter("test2", "test2"),
    ];
    render(
      <table>
        <thead>
          <FilterRow
            filters={filters}
            onSubmit={jest.fn()}
            filterArgs={{ test: "a", test2: "b" }}
          />
        </thead>
      </table>
    );

    expect(screen.getAllByPlaceholderText(/filter/i)).toHaveLength(2);
  });

  it("only renders filters for elements that are searchable", () => {
    const filters = [
      new SortOnlyFilter("test", "test"),
      new SortOnlyFilter("test2", "test2"),
      new TextFilter("test3", "test3"),
    ];
    render(
      <table>
        <thead>
          <FilterRow filters={filters} onSubmit={jest.fn()} filterArgs={{}} />
        </thead>
      </table>
    );

    expect(screen.getAllByPlaceholderText(/filter/i)).toHaveLength(1);
  });

  it('should submit the filters if the "Enter" key is pressed', () => {
    const handleSubmit = jest.fn();
    const filters = [new TextFilter("test", "test")];
    render(
      <table>
        <thead>
          <FilterRow
            filters={filters}
            onSubmit={handleSubmit}
            filterArgs={{}}
          />
        </thead>
      </table>
    );

    act(() => {
      fireEvent.keyDown(screen.getByPlaceholderText(/filter/i), {
        key: "Enter",
        code: "Enter",
        charCode: 13,
      });
    });

    expect(handleSubmit).toBeCalledTimes(1);
  });
});
