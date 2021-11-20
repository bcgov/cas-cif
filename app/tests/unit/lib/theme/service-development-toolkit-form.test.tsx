import React from "react";

import { render } from "@testing-library/react";
import Form from "lib/theme/service-development-toolkit-form";
import { JSONSchema7 } from "json-schema";

describe("The Form", () => {
  it("Renders a basic test schema with a submit button", () => {
    const testSchema: JSONSchema7 = {
      type: "object",
      properties: {
        test_number: { type: "number", title: "Test Number" },
        test_string: { type: "string", title: "Test Script" },
      },
    };

    const componentUnderTest = render(<Form schema={testSchema} />);

    expect(componentUnderTest.container).toMatchSnapshot();
  });
});
