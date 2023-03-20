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
    render(<SelectParentWidget {...props} />);
    const parentDropdown = screen.getByLabelText("Parent Label");
    expect(parentDropdown.value).toEqual("parent placeholder");
    fireEvent.change(parentDropdown, { target: { value: "1" } });
    expect(parentDropdown.value).toEqual("1");
  });

  it("selects the first option from child", async () => {
    render(<SelectParentWidget {...props} />);
    const childDropdown = screen.getByLabelText("Child Label");
    const parentDropdown = screen.getByLabelText("Parent Label");
    fireEvent.change(parentDropdown, { target: { value: "2" } });
    expect(childDropdown.value).toEqual("child placeholder");
    fireEvent.change(childDropdown, { target: { value: "3" } });
    expect(childDropdown.value).toEqual("3");
  });

  it("cannot select the first option from child with non-selected parent", async () => {
    render(<SelectParentWidget {...props} />);
    const childDropdown = screen.getByLabelText("Child Label");
    const parentDropdown = screen.getByLabelText("Parent Label");
    fireEvent.change(parentDropdown, { target: { value: "2" } });
    expect(childDropdown.value).toEqual("child placeholder");
    fireEvent.change(childDropdown, { target: { value: "1" } });
    expect(childDropdown.value).toEqual("");
  });

  it("Matches the snapshot with a default value set", () => {
    const componentUnderTest = render(<SelectParentWidget {...props} />);
    expect(componentUnderTest.container).toMatchSnapshot();
  });

  it("does not show a child placeholder if none is provided", async () => {
    const propsWithoutChildPlaceholder: any = {
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
        displayField: "year",
      },
      foreignKey: "fundingStreamId",
    };
    render(<SelectParentWidget {...propsWithoutChildPlaceholder} />);
    const childDropdown = screen.getByLabelText("Child Label");
    expect(childDropdown.value).toBe("");
  });

  it("shows a value when the child list is empty if displayIfChildrenEmpty prop is given", async () => {
    const emptyChildrenProps: any = {
      displayIfChildrenEmpty: "emptiness",
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
        list: [],
        label: "Child Label",
        displayField: "year",
      },
      foreignKey: "fundingStreamId",
    };
    render(<SelectParentWidget {...emptyChildrenProps} />);
    expect(screen.getByText("emptiness")).toBeVisible();
  });
});
