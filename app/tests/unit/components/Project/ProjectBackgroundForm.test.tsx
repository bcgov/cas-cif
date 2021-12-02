import { render, screen, fireEvent } from "@testing-library/react";
import ProjectBackgroundForm from "components/Project/ProjectBackgroundForm";

describe("The Project Background Form", () => {
  it("matches the snapshot", () => {
    const props = {
      formData: {},
      applyChangeFromComponent: jest.fn(),
    };

    const componentUnderTest = render(<ProjectBackgroundForm {...props} />);

    expect(componentUnderTest.container).toMatchSnapshot();
  });
  it("triggers the applyFormChange with the proper data", () => {
    const applySpy = jest.fn();

    const props = {
      formData: {},
      applyChangeFromComponent: applySpy,
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
    const props = {
      formData: {
        unique_project_id: "12345678",
        description: "d",
      },
      applyChangeFromComponent: jest.fn(),
    };

    render(<ProjectBackgroundForm {...props} />);

    expect(screen.getByLabelText("Unique Project Identifier*").value).toBe(
      "12345678"
    );
    expect(screen.getByLabelText("Description*").value).toBe("d");
  });
});
