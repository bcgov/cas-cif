import ApplicationOverviewForm from "components/Form/ApplicationOverviewForm";
import { useMemo } from "react";
import {
  buildFormPages,
  buildNumberedFormStructure,
} from "../../lib/pages/formStructureFunctions";
import { IFormSection } from "./types";

export const useFormStructure: (
  fundingStream: String
) => IFormSection[] = () => {
  return useMemo(
    () => [
      {
        title: "Application Overview",
        items: [
          {
            title: "Application Overview",
            formConfiguration: {
              slug: "applicationOverview",
              editComponent: ApplicationOverviewForm,
              viewComponent: null,
            },
          },
        ],
      },
    ],
    []
  );
};

export const useExternalNumberedFormStructure = (fundingStream: String) =>
  buildNumberedFormStructure(useFormStructure(fundingStream));
export const useExternalFormPages = (fundingStream: String) =>
  buildFormPages(useExternalNumberedFormStructure(fundingStream));
