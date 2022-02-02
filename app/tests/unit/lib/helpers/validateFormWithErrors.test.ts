import validateFormWithErrors from "lib/helpers/validateFormWithErrors";

const getMockForm = () =>
  ({
    onSubmit: jest.fn(),
    validate: jest.fn().mockReturnValue({ errors: [{ anError: "is here" }] }),
    state: { formData: { data: "mock" } },
  } as any);

describe("The validateFormWithErrors helper method", () => {
  it("Calls onSubmit with an empty event", () => {
    const form = getMockForm();
    validateFormWithErrors(form);

    expect(form.onSubmit).toHaveBeenCalledOnce();
    expect(form.onSubmit).toHaveBeenCalledWith({
      preventDefault: expect.any(Function),
      persist: expect.any(Function),
    });
  });

  it("returns the errors returned by the validate function of the form", () => {
    const form = getMockForm();
    const result = validateFormWithErrors(form);

    expect(form.validate).toHaveBeenCalledOnce();
    expect(form.validate).toHaveBeenCalledWith({ data: "mock" });

    expect(result).toEqual([{ anError: "is here" }]);
  });
});
