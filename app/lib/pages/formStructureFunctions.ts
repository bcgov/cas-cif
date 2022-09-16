import { IFormSection, INumberedFormSection } from "../../data/formPages/types";

// We walk through the structure to number everything with section numbers and form indices
export const buildNumberedFormStructure = (
  inputFormStructure: IFormSection[]
) => {
  let currentSectionNumber = 1;
  let currentFormIndex = 0;

  let numberedSections = [] as INumberedFormSection[];

  inputFormStructure.forEach((section) => {
    const numberedSection: INumberedFormSection = {
      title: section.title,
      optional: section.optional,
      sectionNumber: currentSectionNumber++,
      formConfiguration: section.formConfiguration
        ? {
            ...section.formConfiguration,
            formIndex: currentFormIndex++,
          }
        : undefined,
      items: section.items?.map((item) => {
        return {
          title: item.title,
          formConfiguration: item.formConfiguration && {
            ...item.formConfiguration,
            formIndex: currentFormIndex++,
          },
        };
      }),
    };

    numberedSections.push(numberedSection);
  });

  return numberedSections;
};

export const buildFormPages = (
  numberedFormSections: INumberedFormSection[]
) => {
  return numberedFormSections
    .map((section) =>
      [
        section.formConfiguration,
        ...(section.items?.map((s) => s.formConfiguration) ?? []),
      ].filter((formConfiguration) => formConfiguration)
    )
    .flat();
};
