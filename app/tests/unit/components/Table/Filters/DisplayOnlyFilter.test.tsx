import React from "react";
import { DisplayOnlyFilter } from "components/Table/Filters";
import { render, screen } from "@testing-library/react";

describe("the display only filter option", () => {
  const filterUnderTest = new DisplayOnlyFilter("display header");

  it("renders an empty td component", () => {
    render(
      <table>
        <tbody>
          <tr>
            <filterUnderTest.Component />
          </tr>
        </tbody>
      </table>
    );
    expect(screen).toMatchSnapshot();
  });

  it("should not be sortable or searchable", () => {
    expect(filterUnderTest.isSearchEnabled).toBeFalse();
    expect(filterUnderTest.isSortEnabled).toBeFalse();
  });
});
