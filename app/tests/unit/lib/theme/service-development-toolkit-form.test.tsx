import React from "react";
import { mockRandom } from "jest-mock-random";
import { render } from "@testing-library/react";
import Form from "lib/theme/service-development-toolkit-form";
import { JSONSchema7 } from "json-schema";

describe("The Form", () => {
  beforeEach(() => {
    // Mock Math.random() to be deterministic.
    // This is needed by react-jsonschema-form's RadioWidget and by json-schema-faker
    mockRandom([0.1, 0.2, 0.3, 0.4, 0.5]);
  });
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
