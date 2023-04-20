import React from "react";
import SelectParentWidget from "lib/theme/widgets/SelectParentWidget";
import { render, fireEvent, screen, act } from "@testing-library/react";

const onChangeMock = jest.fn();

const props: any = {
  id: "test-id",
  onChange: onChangeMock,
  value: undefined,
  isInternal: true,
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
    act(() => fireEvent.change(parentDropdown, { target: { value: "1" } }));
    expect(parentDropdown.value).toEqual("1");
    expect(onChangeMock).toHaveBeenCalledWith(undefined);
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

  it("selects the first option from parent by an external user", async () => {
    render(<SelectParentWidget {...props} isInternal={false} />);
    const parentDropdownExternal = screen.getByLabelText("Parent Label");
    act(() =>
      fireEvent.change(parentDropdownExternal, { target: { value: "1" } })
    );
    expect(parentDropdownExternal.value).toEqual("1");
    // calls the rowId of the latest option by year in the child list that matches the parent value
    expect(onChangeMock).toHaveBeenCalledWith(2);
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
      onChange: onChangeMock,
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
});
