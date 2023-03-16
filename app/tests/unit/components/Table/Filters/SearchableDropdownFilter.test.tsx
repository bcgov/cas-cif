import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchableDropdownFilter } from "components/Table/Filters";

const renderFilterComponent = (filterComponentOptionsOverride?) => {
  const options = {
    onChange: jest.fn(),
    filterArgs: { filterName: "testValue" },
    ...filterComponentOptionsOverride,
  };

  const filterUnderTest: SearchableDropdownFilter =
    new SearchableDropdownFilter("display name", "filterName", [
      "one",
      "two",
      "three",
    ]);
  render(
    <table>
      <tbody>
        <tr>
          <filterUnderTest.Component {...options} />
        </tr>
      </tbody>
    </table>
  );
};

describe("The searchable dropdown filter", () => {
  it("initializes with the value passed in the filter args", () => {
    renderFilterComponent();
    expect(screen.queryByDisplayValue("testValue")).toBeInTheDocument();
  });
  it("shows a list of all passed options", () => {
    renderFilterComponent();

    const input = screen.queryByPlaceholderText("Filter");
    act(() => {
      userEvent.click(input);
    });

    expect(screen.getByText("one")).toBeInTheDocument();
    expect(screen.getByText("two")).toBeInTheDocument();
    expect(screen.getByText("three")).toBeInTheDocument();
  });
  it("calls the onChange method when one value is selected in the list", () => {
    const onChange = jest.fn();
    renderFilterComponent({ onChange, filterArgs: {} });

    const input = screen.queryByPlaceholderText("Filter");
    act(() => {
      userEvent.click(input);
    });

    screen.getByText("one").click();
    expect(onChange).toHaveBeenCalledWith("one", "filterName");
  });
  it("calls the onChange method when anything is typed in the search box", () => {
    const onChange = jest.fn();
    renderFilterComponent({ onChange, filterArgs: {} });

    const input = screen.queryByPlaceholderText("Filter");
    userEvent.type(input, "searchquery");

    expect(onChange).toHaveBeenCalledWith("searchquery", "filterName");
  });
});
