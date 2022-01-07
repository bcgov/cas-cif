import React from "react";
import SelectParentWidget from "lib/theme/widgets/SelectParentWidget";

import { render, fireEvent, screen } from "@testing-library/react";

const props: any = {
  id: "test-id",
  onChange: jest.fn(),
  value: undefined,
  required: false,
  parent: {
    list: [
      {
        rowId: 1,
        name: "EP",
        fundingStreamId: 1,
      },
      {
        rowId: 2,
        name: "IA",
        fundingStreamId: 2,
      },
    ],
    label: "Parent Label",
    placeholder: "parent placeholder",
    displayField: "name",
  },
  child: {
    list: [
      {
        rowId: 1,
        year: 2019,
        fundingStreamId: 1,
      },
      {
        rowId: 2,
        year: 2020,
        fundingStreamId: 1,
      },
      {
        rowId: 3,
        year: 2021,
        fundingStreamId: 2,
      },
      {
        rowId: 4,
        year: 2022,
        fundingStreamId: 2,
      },
    ],
    label: "Child Label",
    placeholder: "child placeholder",
    displayField: "year",
  },
  foreignKey: "fundingStreamId",
};

describe("The SelectParentWidget Widget", () => {
  it("selects the first option from parent", async () => {
    const selectParentWidget = render(<SelectParentWidget {...props} />);
    const parentDropdown = selectParentWidget.container.querySelector(
      "#select-parent-dropdown-test-id"
    );
    expect(screen.getByLabelText("Parent Label").value).toEqual(
      "parent placeholder"
    );
    fireEvent.change(parentDropdown, { target: { value: "1" } });
    expect(screen.getByLabelText("Parent Label").value).toEqual("1");
  });

  it("selects the first option from child", async () => {
    const selectParentWidget = render(<SelectParentWidget {...props} />);
    const childDropdown = selectParentWidget.container.querySelector(
      "#select-child-dropdown-test-id"
    );
    const parentDropdown = selectParentWidget.container.querySelector(
      "#select-parent-dropdown-test-id"
    );
    fireEvent.change(parentDropdown, { target: { value: "2" } });
    expect(screen.getByLabelText("Child Label").value).toEqual(
      "child placeholder"
    );
    fireEvent.change(childDropdown, { target: { value: "3" } });
    expect(screen.getByLabelText("Child Label").value).toEqual("3");
  });

  it("cannot select the first option from child with non-selected parent", async () => {
    const selectParentWidget = render(<SelectParentWidget {...props} />);
    const childDropdown = selectParentWidget.container.querySelector(
      "#select-child-dropdown-test-id"
    );
    const parentDropdown = selectParentWidget.container.querySelector(
      "#select-parent-dropdown-test-id"
    );
    fireEvent.change(parentDropdown, { target: { value: "2" } });
    expect(screen.getByLabelText("Child Label").value).toEqual(
      "child placeholder"
    );
    fireEvent.change(childDropdown, { target: { value: "1" } });
    expect(screen.getByLabelText("Child Label").value).toEqual("");
  });

  it("Matches the snapshot with a default value set", () => {
    const componentUnderTest = render(<SelectParentWidget {...props} />);
    expect(componentUnderTest.container).toMatchSnapshot();
  });
});
