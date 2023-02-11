import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SelectWidget from "lib/theme/widgets/SelectWidget";
import routinelyUpdatedFieldFactory from "components/ProjectRevision/routinelyUpdatedFieldFactory";
import DateWidget from "lib/theme/widgets/DateWidget";
import NumberWidget from "lib/theme/widgets/NumberWidget";
import TextWidget from "lib/theme/widgets/TextWidget";
import React from "react";
import SearchDropdownWidget from "lib/theme/widgets/SearchDropdownWidget";

// mocking the bcgov theme button because we need enable the button for testing
jest.mock("@button-inc/bcgov-theme", () => ({
  Button: jest.fn().mockImplementation(({ children, ...props }) => {
    return (
      <button {...props} disabled={false}>
        {children}
      </button>
    );
  }),
}));

// TODO: remove this when we have a mock of the mutation function
const logSpy = jest.spyOn(global.console, "log");

const updateFn = jest.fn();
const mockedMutationFnHook = jest.fn().mockReturnValue([updateFn, false]);

describe("The routinely updated field factory", () => {
  it("should render a TextWidget", async () => {
    const props: any = {
      id: "test-id",
      onChange: jest.fn(),
      label: "Comment",
      placeholder: "test-placeholder",
      value: "test value",
      formContext: { projectRevision: {} },
    };

    const WrappedWidget = routinelyUpdatedFieldFactory(
      TextWidget,
      mockedMutationFnHook,
      "test-string-field-name",
      "test-form-data-table-name"
    );

    render(<WrappedWidget {...props} />);

    const commentField: HTMLTextAreaElement = screen.getByRole("textbox", {
      name: /comment/i,
    });
    expect(commentField.value).toEqual("test value");

    userEvent.clear(commentField);
    userEvent.type(commentField, "new value");

    const updateButton = screen.getByRole("button", {
      name: /update/i,
    });
    expect(updateButton).not.toBeDisabled();
    updateButton.click();
    // TODO: replace this with a mock of the mutation function
    expect(logSpy).toHaveBeenCalledWith("update mutation called");
  });

  it("should render a NumberWidget", () => {
    const props: any = {
      id: "test-id",
      schema: {
        type: "number",
        title: "Number",
        default: 0,
      },
      onChange: jest.fn(),
      placeholder: "test-placeholder",
      value: 23,
      formContext: { projectRevision: {} },
    };

    const WrappedWidget = routinelyUpdatedFieldFactory(
      NumberWidget,
      mockedMutationFnHook,
      "test-number-field-name",
      "test-form-data-table-name"
    );

    render(<WrappedWidget {...props} />);

    const numberField: HTMLTextAreaElement = screen.getByRole("textbox");
    expect(numberField.value).toEqual("23");

    userEvent.clear(numberField);
    userEvent.type(numberField, "987");
    expect(numberField.value).toEqual("987");

    const updateButton = screen.getByRole("button", {
      name: /update/i,
    });
    expect(updateButton).not.toBeDisabled();
    updateButton.click();
    // TODO: replace this with a mock of the mutation function
    expect(logSpy).toHaveBeenCalledWith("update mutation called");
  });
  it("should render a DateWidget", () => {
    const props: any = {
      id: "test-id",
      label: "Date",
      onChange: jest.fn(),
      value: "2020-01-01T23:59:59.999-07:00",
      formContext: { projectRevision: {} },
    };

    const WrappedWidget = routinelyUpdatedFieldFactory(
      DateWidget,
      mockedMutationFnHook,
      "test-date-field-name",
      "test-form-data-table-name"
    );

    render(<WrappedWidget {...props} />);

    expect(screen.getByText(/Jan[.]? 01, 2020/)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/date/i));
    userEvent.selectOptions(screen.getAllByRole("combobox")[0], "11");
    userEvent.selectOptions(screen.getAllByRole("combobox")[1], "2050");
    userEvent.click(
      screen.getByRole("option", {
        name: /choose thursday, december 15th, 2050/i,
      })
    );
    const updateButton = screen.getByRole("button", {
      name: /update/i,
    });
    expect(updateButton).not.toBeDisabled();
    updateButton.click();
    // TODO: replace this with a mock of the mutation function
    expect(logSpy).toHaveBeenCalledWith("update mutation called");
  });
  it("should render a SelectWidget", () => {
    const props: any = {
      id: "test-id",
      label: "Select",
      placeholder: "test-placeholder",
      onChange: jest.fn(),
      value: undefined,
      formContext: { projectRevision: {} },
      schema: {
        anyOf: [
          { value: 1, enum: [1], type: "number", title: "Option 1" },
          { value: 2, enum: [2], type: "number", title: "Option 2" },
        ],
      },
    };

    const WrappedWidget = routinelyUpdatedFieldFactory(
      SelectWidget,
      mockedMutationFnHook,
      "test-select-field-name",
      "test-form-data-table-name"
    );

    render(<WrappedWidget {...props} />);

    const dropdown: HTMLSelectElement = screen.getByRole("combobox", {
      name: /select/i,
    });

    expect(dropdown.value).toEqual("test-placeholder");

    fireEvent.change(dropdown, { target: { value: "1" } });
    expect(dropdown.value).toEqual("1");

    const updateButton = screen.getByRole("button", {
      name: /update/i,
    });
    expect(updateButton).not.toBeDisabled();
    updateButton.click();
    // TODO: replace this with a mock of the mutation function
    expect(logSpy).toHaveBeenCalledWith("update mutation called");
  });
  it("should render a SearchDropdownWidget", async () => {
    const props: any = {
      id: "test-id",
      placeholder: "test placeholder",
      onChange: jest.fn(),
      label: "Search",
      value: 1,
      formContext: { projectRevision: {} },
      schema: {
        anyOf: [
          { value: 1, enum: [1], type: "number", title: "Option 1" },
          { value: 2, enum: [2], type: "number", title: "Option 2" },
        ],
      },
    };

    const WrappedWidget = routinelyUpdatedFieldFactory(
      SearchDropdownWidget,
      mockedMutationFnHook,
      "test-search-dropdown-field-name",
      "test-form-data-table-name"
    );

    render(<WrappedWidget {...props} />);

    const dropdown: HTMLInputElement = screen.getByRole("combobox");

    expect(dropdown.value).toEqual("Option 1");

    fireEvent.change(dropdown, { target: { value: 2 } });

    const updateButton = screen.getByRole("button", {
      name: /update/i,
    });
    expect(updateButton).not.toBeDisabled();
    updateButton.click();

    // TODO: replace this with a mock of the mutation function
    expect(logSpy).toHaveBeenCalledWith("update mutation called");
  });
});
