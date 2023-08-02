export const fundingTooltips = {
  totalProjectValue:
    "<div><ul><li>Total Project Value = Maximum Funding Amount + Proponent Cost + Additional Funding Amount (Source 1) + Additional Funding Amount (Source 2) + ... + Additional Funding amount (Source N).</li></ul></div>",

  maxFundingAmount:
    "<div><ul><li>The maximum payment amount that the proponent can receive from CIF.</li></ul></div>",

  provinceSharePercentage:
    "<div><ul><li>Typically, 50% at most.</li></ul></div>",

  holdbackPercentage:
    "<div><ul><li>Typically, 10%.</li><li>2019 projects may have percentages higher than 10%.</li></ul></div>",

  proponentsSharePercentage:
    "<div><ul><li>Proponent's share percentage = Proponent Cost / Total Project Value</li><li>The Proponent's Share Percentage should be NO LESS than 25%.</li><li>For 2021 projects, the Proponent's Share Percentage should be NO LESS than 25%.</li></ul></div>",

  proponentCost:
    "<div><ul><li>The amount of expenses paid by the proponent.</li></ul></div>",

  eligibleExpensesToDate:
    "<div><ul><li>The accumulated Total Eligible Expenses from all completed Milestone Reports.</li></ul></div>",

  grossPaymentsToDate:
    "<div><ul><li>The accumulated Gross Payment Amounts from all completed Milestone Reports.</li><li>The Total Gross Payment Amoun To Date should be NO GREATER than the Maximum Funding Amount.</li></ul></div>",

  holdbackAmountToDate:
    "<div><ul><li>The accumulated Holdback Payment Amounts from all completed Milestone Reports.</li></ul></div>",

  netPaymentsToDate:
    "<div><ul><li>The accumulated Net Payment Amounts from all completed Milestone Reports.</li></ul></div>",

  additionalFundingSourcesAmount:
    "<div><ul><li>The amount of payment from Funding Source N other than CIF.</li><li>Typically found in the original proposal (solicitation folder on the LAN).</li></ul></div>",
};

export const emissionsIntentityTooltips = {
  adjustedEmissionsIntensityPerformance:
    "<div><ul><li>GHG Emission Intensity Performance = (BEI - PEI) / (BEI - TEI) x 100</li></ul></div>",

  paymentPercentage:
    "<div><ul><li>Payment Percentage of Performance Milestone Amount = 100 – ((-1.5) x GHG Emission Intensity Performance + 145)</li></ul></div>",

  actualPerformanceMilestoneAmount:
    "<div><ul><li>Actual Performance Milestone Amount = Maximum Performance Milestone Amount x Payment Percentage of Performance Milestone Amount</li></ul></div>",

  maximumPerformanceMilestoneAmount:
    "<div><ul><li>Maximum Performance Milestone Amount = Holdback Payment Amount (Milestone Report 1) + Holdback Payment Amount (Milestone Report 2) + ... + Holdback Payment Amount (Milestone Report N)</li></ul></div>",
};

export const milestoneTooltips = {
  maximumAmount:
    "<div><ul><li>The maximum payment amount that the proponent can receive from CIF for this milestone.</li><li>Typically found in schedule D.</ul></div>",

  totalEligibleExpenses:
    "<div><ul><li>The amount of total eligible expenses paid by the proponent for this milestone.</li></ul></div>",

  adjustedGrossAmount:
    "<div><ul><li>Gross Payment Amount This Milestone = Total Eligible Expenses This Milestone x Province's Share Percentage.</li><li>The Gross Payment Amount This Milestone is the smaller value between the calculated value above and the Maximum Milestone Payment Amount This Milestone.</li></ul></div>",

  adjustedNetAmount:
    "<div>Net Payment Amount This Milestone = Gross Payment Amount This Milestone - Holdback Payment Amount This Milestone.</div>",

  adjustedHoldBackAmount:
    "<div><ul><li>Holdback Payment Amount This Milestone = Gross Payment Amount This Milestone x Performance Milestone Holdback Percentage.</li></ul></div>",
};
