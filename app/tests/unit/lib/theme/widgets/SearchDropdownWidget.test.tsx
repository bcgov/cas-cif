import React from "react";
import SearchDropdownWidget from "lib/theme/widgets/SearchDropdownWidget";

import { render } from "@testing-library/react";

describe("The SearchDropdown Widget", () => {
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

    const componentUnderTest = render(<SearchDropdownWidget {...props} />);

    expect(componentUnderTest.container).toMatchSnapshot();
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

    const componentUnderTest = render(<SearchDropdownWidget {...props} />);

    expect(componentUnderTest.container).toMatchSnapshot();
  });

  it("Returns 'No options' when no schema.anyOf is empty", () => {
    const props: any = {
      id: "1",
      placeholder: "test placeholder",
      onChange: jest.fn(),
      label: "Search",
      value: 1,
      required: false,
      schema: {
        anyOf: [],
      },
    };

    const componentUnderTest = render(<SearchDropdownWidget {...props} />);

    expect(componentUnderTest.container).toMatchSnapshot();
  });
});
