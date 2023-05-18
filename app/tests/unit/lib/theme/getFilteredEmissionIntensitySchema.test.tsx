import { getFilteredEmissionIntensitySchema } from "lib/theme/getFilteredEmissionIntensitySchema";

describe("getFilteredEmissionIntensitySchema", () => {
  const formSchema = {
    properties: {
      teimpReporting: {
        properties: {
          property1: {},
          property2: {},
        },
      },
      uponCompletion: {
        properties: {
          property3: {},
          property4: {},
          calculatedProperty2: {},
        },
      },
      calculatedValues: {
        properties: {
          calculatedProperty1: {},
        },
      },
    },
  };

  const formChange = {
    calculatedProperty1: "calculatedValue1",
    calculatedProperty2: "calculatedValue2-changed",
    newFormData: {
      teimpReporting: {
        property1: "value1",
      },
      uponCompletion: {
        property3: "value3-changed",
        property4: "value4",
      },
    },
    formChangeByPreviousFormChangeId: {
      calculatedProperty2: "calculatedValue2",
      newFormData: {
        teimpReporting: {
          property1: "value1",
          property2: "value2",
        },
        uponCompletion: {
          property3: "value3",
        },
      },
    },
  };

  it("should filter out unchanged properties and return the filtered schema and formData object", () => {
    const expectedFilteredSchema = {
      properties: {
        teimpReporting: {
          properties: {
            property2: {},
          },
        },
        uponCompletion: {
          properties: {
            property3: {},
            property4: {},
            calculatedProperty2: {},
          },
        },
        calculatedValues: {
          properties: {
            calculatedProperty1: {},
          },
        },
      },
    };

    const expectedFormData = {
      teimpReporting: {
        property2: undefined,
      },
      uponCompletion: {
        property3: "value3-changed",
        property4: "value4",
        calculatedProperty2: "calculatedValue2-changed",
      },
      calculatedValues: {
        calculatedProperty1: "calculatedValue1",
      },
    };

    const result = getFilteredEmissionIntensitySchema(formSchema, formChange);

    expect(result.formSchema).toEqual(expectedFilteredSchema);
    expect(result.formData).toEqual(expectedFormData);
  });
});
