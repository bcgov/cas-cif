import { render } from "@testing-library/react";
import ObjectFieldTemplate from "lib/theme/ObjectFieldTemplate";
import React from "react";

describe("The Object Field Template", () => {
  it("renders a default TitleField and DescriptionField", () => {
    const props = {
      idSchema: { $id: "test-id" },
      uiSchema: {},
      properties: [],
      type: "object",
      title: "Test Title",
      description: "Test Description",
    };

    const componentUnderTest = render(<ObjectFieldTemplate {...props} />);

    expect(componentUnderTest.container).toMatchSnapshot();
  });

  it("renders the provided TitleField and DescriptionField with the provided title and description", () => {
    const props = {
      idSchema: { $id: "test-id" },
      uiSchema: {},
      properties: [],
      type: "object",
      title: "Second title",
      description: "Another Description",
      TitleField: ({ title }) => <p>Test {title}</p>,
      DescriptionField: ({ description }) => <p>Test {description}</p>,
    };

    const componentUnderTest = render(<ObjectFieldTemplate {...props} />);
    expect(componentUnderTest.container).toMatchSnapshot();
  });
});
