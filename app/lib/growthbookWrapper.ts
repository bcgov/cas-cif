import { useFeature } from "@growthbook/growthbook-react";
import getConfig from "next/config";

const runtimeConfig = getConfig()?.publicRuntimeConfig ?? {};

export default function useShowGrowthbookFeature(feature: string) {
  return useFeature(feature).on || !runtimeConfig.BYPASS_GROWTHBOOK;
}
