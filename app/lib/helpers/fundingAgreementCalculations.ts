export const calculateProponentsSharePercentage = (
  proponentCost: number | undefined,
  totalProjectValue: number | undefined
): number | undefined => {
  if (!proponentCost || !totalProjectValue) return undefined;
  return (proponentCost / totalProjectValue) * 100;
};
