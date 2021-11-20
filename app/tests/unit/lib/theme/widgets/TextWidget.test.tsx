import React from "react";
import TextWidget from "lib/theme/widgets/TextWidget";

import { render } from "@testing-library/react";

describe("The Text Widget", () => {
  it("Matches the snapshot with the value set", () => {
    const props: any = {
      id: "1",
      placeholder: "test placeholder",
      onChange: jest.fn(),
      label: "",
      value: "test",
      required: false,
    };

    const componentUnderTest = render(<TextWidget {...props} />);

    expect(componentUnderTest.container).toMatchSnapshot();
  });
});
