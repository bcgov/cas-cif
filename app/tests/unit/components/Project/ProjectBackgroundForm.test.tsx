import { render, screen, fireEvent } from "@testing-library/react";
import FormComponentProps from "components/Project/FormComponentProps";
import ProjectBackgroundForm from "components/Project/ProjectBackgroundForm";

describe("The Project Background Form", () => {
  it("matches the snapshot", () => {
    const props: FormComponentProps = {
      formData: {},
      applyChangesFromComponent: jest.fn(),
      onFormErrors: jest.fn(),
    };

    const componentUnderTest = render(<ProjectBackgroundForm {...props} />);

    expect(componentUnderTest.container).toMatchSnapshot();
  });
  it("triggers the applyFormChange with the proper data", () => {
    const applySpy = jest.fn();

    const props: FormComponentProps = {
      formData: {},
      applyChangesFromComponent: applySpy,
      onFormErrors: jest.fn(),
    };

    render(<ProjectBackgroundForm {...props} />);

    fireEvent.change(screen.getByLabelText("Unique Project Identifier*"), {
      target: { value: "testidentifier" },
    });

    expect(applySpy).toHaveBeenCalledWith({
      unique_project_id: "testidentifier",
      description: undefined,
    });
    applySpy.mockClear();

    fireEvent.change(screen.getByLabelText("Description*"), {
      target: { value: "testdescription" },
    });

    expect(applySpy).toHaveBeenCalledWith({
      unique_project_id: "testidentifier",
      description: "testdescription",
    });
  });
  it("loads with the correct initial form data", () => {
    const props: FormComponentProps = {
      formData: {
        unique_project_id: "12345678",
        description: "d",
      },
      applyChangesFromComponent: jest.fn(),
      onFormErrors: jest.fn(),
    };

    render(<ProjectBackgroundForm {...props} />);

    expect(screen.getByLabelText("Unique Project Identifier*").value).toBe(
      "12345678"
    );
    expect(screen.getByLabelText("Description*").value).toBe("d");
  });
  it("calls onformerrors on first render if there are errors", () => {
    const onFormErrorsSpy = jest.fn();

    const props: FormComponentProps = {
      formData: {
        unique_project_id: "12345678",
        description: "d",
      },
      applyChangesFromComponent: jest.fn(),
      onFormErrors: onFormErrorsSpy,
    };

    render(<ProjectBackgroundForm {...props} />);

    expect(onFormErrorsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        unique_project_id: expect.anything(),
        description: null,
      })
    );
  });

  it("calls onformerrors with null if there are no errors", () => {
    const onFormErrorsSpy = jest.fn();

    const props: FormComponentProps = {
      formData: {
        unique_project_id: "1999-RFP-1-123-ABCD",
        description: "d",
      },
      applyChangesFromComponent: jest.fn(),
      onFormErrors: onFormErrorsSpy,
    };

    render(<ProjectBackgroundForm {...props} />);

    expect(onFormErrorsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        unique_project_id: null,
        description: null,
      })
    );
  });

  it("calls onformerrors if a fields becomes empty", () => {
    const onFormErrorsSpy = jest.fn();

    const props: FormComponentProps = {
      formData: {
        unique_project_id: "1999-RFP-1-123-ABCD",
        description: "desc",
      },
      applyChangesFromComponent: jest.fn(),
      onFormErrors: onFormErrorsSpy,
    };

    render(<ProjectBackgroundForm {...props} />);

    fireEvent.change(screen.getByLabelText("Description*"), {
      target: { value: "" },
    });

    expect(onFormErrorsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        unique_project_id: null,
        description: { __errors: ["is a required property"] },
      })
    );
  });

  it("calls onformerrors if the project unique id doesnt match format", () => {
    const onFormErrorsSpy = jest.fn();

    const props: FormComponentProps = {
      formData: {
        unique_project_id: "1999123-RFP-1-123-ABCD",
        description: "desc",
      },
      applyChangesFromComponent: jest.fn(),
      onFormErrors: onFormErrorsSpy,
    };

    render(<ProjectBackgroundForm {...props} />);

    expect(onFormErrorsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        unique_project_id: expect.anything(),
        description: null,
      })
    );
  });
});
