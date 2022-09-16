import { IFormSection, INumberedFormSection } from "data/formPages/types";
import {
  buildFormPages,
  buildNumberedFormStructure,
} from "lib/pages/formStructureFunctions";

describe("the buildNumberedFormStructure function", () => {
  it("returns an empty array when passed an empty array", () => {
    expect(buildNumberedFormStructure([])).toEqual([]);
  });
  it("numbers sections and forms based on their position in the array", () => {
    const input: IFormSection[] = [
      {
        title: "test with formConfig",
        formConfiguration: {
          slug: "first form",
        } as any,
      },
      {
        title: "test with items",
        items: [
          {
            title: "item1",
            formConfiguration: {
              slug: "second form",
            } as any,
          },
          {
            title: "item2",
            formConfiguration: {
              slug: "third form",
            } as any,
          },
        ],
      },
    ];

    expect(buildNumberedFormStructure(input)).toEqual([
      {
        formConfiguration: { formIndex: 0, slug: "first form" },
        items: undefined,
        optional: undefined,
        sectionNumber: 1,
        title: "test with formConfig",
      },
      {
        formConfiguration: undefined,
        items: [
          {
            formConfiguration: { formIndex: 1, slug: "second form" },
            title: "item1",
          },
          {
            formConfiguration: { formIndex: 2, slug: "third form" },
            title: "item2",
          },
        ],
        optional: undefined,
        sectionNumber: 2,
        title: "test with items",
      },
    ]);
  });
});

describe("the buildFormPages function", () => {
  it("extracts all the forms form into a flat array, while keeping the order", () => {
    const input: INumberedFormSection[] = [
      {
        title: "test with formConfig",
        formConfiguration: {
          slug: "first form",
          formIndex: 0,
        } as any,
        sectionNumber: 1,
      },
      {
        title: "test with items",
        sectionNumber: 2,
        items: [
          {
            title: "item1",
            formConfiguration: {
              slug: "second form",
              formIndex: 1,
            } as any,
          },
          {
            title: "item2",
            formConfiguration: {
              slug: "third form",
              formIndex: 2,
            } as any,
          },
        ],
      },
    ];

    expect(buildFormPages(input)).toEqual([
      { formIndex: 0, slug: "first form" },
      { formIndex: 1, slug: "second form" },
      { formIndex: 2, slug: "third form" },
    ]);
  });
});
