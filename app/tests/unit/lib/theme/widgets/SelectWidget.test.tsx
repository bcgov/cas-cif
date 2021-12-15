import React from "react";
import SelectWidget from "lib/theme/widgets/SelectWidget";

import { render, fireEvent, screen } from "@testing-library/react";

describe("The SelectWidget Widget", () => {
  it("Matches the snapshot with no default value set", () => {
    const props: any = {
      id: "1",
      placeholder: "test placeholder",
      onChange: jest.fn(),
      label: "Search",
      value: undefined,
      required: false,
      schema: {
        anyOf: [
          { value: 1, enum: [1], type: "number", title: "Option 1" },
          { value: 2, enum: [2], type: "number", title: "Option 2" },
        ],
      },
    };

    const componentUnderTest = render(<SelectWidget {...props} />);
    expect(componentUnderTest.container).toMatchSnapshot();
  });

  it("selects the first option from default", async () => {
    const props: any = {
      id: "test-dropdown",
      placeholder: "test-placeholder",
      onChange: jest.fn(),
      label: "test-dropdown-label",
      value: undefined,
      required: false,
      schema: {
        anyOf: [
          { value: 1, enum: [1], type: "number", title: "Option 1" },
          { value: 2, enum: [2], type: "number", title: "Option 2" },
        ],
      },
    };

    const selectWidget = render(<SelectWidget {...props} />);
    const dropdown = selectWidget.container.querySelector("#test-dropdown");
    expect(
      screen.getByRole("combobox", { name: "test-dropdown-select" }).value
    ).toEqual("test-placeholder");
    fireEvent.change(dropdown, { target: { value: "1" } });
    expect(
      screen.getByRole("combobox", { name: "test-dropdown-select" }).value
    ).toEqual("1");
  });

  it("Matches the snapshot with a default value set", () => {
    const props: any = {
      id: "1",
      placeholder: "test placeholder",
      onChange: jest.fn(),
      label: "Search",
      value: 1,
      required: false,
      schema: {
        anyOf: [
          { value: 1, enum: [1], type: "number", title: "Option 1" },
          { value: 2, enum: [2], type: "number", title: "Option 2" },
        ],
      },
    };

    const componentUnderTest = render(<SelectWidget {...props} />);

    expect(componentUnderTest.container).toMatchSnapshot();
  });
});
