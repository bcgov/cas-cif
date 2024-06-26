import "happo-cypress";
import "@testing-library/cypress/add-commands";
import { DateTime } from "luxon";
import logAxeResults from "../plugins/logAxeResults";

Cypress.Commands.add("login", (username, password) => {
  // Open the login page, fill in the form with username and password and submit.
  return cy
    .request({
      method: "POST",
      url: "/login",
      followRedirect: true,
      retryOnStatusCodeFailure: true,
    })
    .then((response) => {
      const el = document.createElement("html");
      el.innerHTML = response.body;
      // This should be more strict depending on your login page template.
      const loginForm = el.querySelectorAll("form");
      const isAlreadyLoggedIn = !loginForm.length;
      if (isAlreadyLoggedIn) {
        return;
      }

      return cy.request({
        form: true,
        method: "POST",
        url: loginForm[0].action,
        followRedirect: true,
        retryOnStatusCodeFailure: true,
        body: {
          username,
          password,
        },
      });
    });
});

Cypress.Commands.add("logout", () =>
  cy.request({
    method: "POST",
    url: "/logout",
    followRedirect: true,
    retryOnStatusCodeFailure: true,
  })
);

Cypress.Commands.add("mockLogin", (roleName) => {
  cy.setCookie("mocks.auth", roleName);
  cy.getCookie("mocks.auth").should("exist");
});

Cypress.Commands.add("sqlFixture", (fixtureName) => {
  cy.getCookies().then((cookies) => {
    const mockedTimeCookie = cookies.filter(
      (cookie) => cookie.name === "mocks.mocked_timestamp"
    )[0];
    const pgOptions = mockedTimeCookie
      ? `PGOPTIONS="--search_path=mocks,public,pg_catalog -c mocks.mocked_timestamp=${mockedTimeCookie.value}"`
      : "";

    return cy.fixture(`${fixtureName}.sql`).then((fixture) =>
      cy.exec(
        `${pgOptions} psql -v "ON_ERROR_STOP=1" -d cif<< 'EOF'
${fixture}
EOF`
      )
    );
  });
});

Cypress.Commands.add("useMockedTime", (dateTime) => {
  cy.setCookie(
    "mocks.mocked_timestamp",
    Math.round(dateTime.getTime() / 1000).toString()
  );
});
Cypress.Commands.add("clearMockedTime", () => {
  cy.clearCookie("mocks.mocked_timestamp");
});

Cypress.Commands.add(
  "fillAndCheckNewProjectForm",
  (fundingStream, fundingStreamYear) => {
    cy.url().should("include", "/new");
    cy.get("[id=select-parent-dropdown-root_fundingStreamRfpId]").select(
      fundingStream
    );
    cy.get("[id=select-child-dropdown-root_fundingStreamRfpId]").select(
      fundingStreamYear
    );
    cy.get("option").contains(fundingStream).should("be.selected");
    cy.get("option").contains(fundingStreamYear).should("be.selected");

    return cy.url().should("include", "new");
  }
);

Cypress.Commands.add(
  "fillOverviewForm",
  (
    operatorName,
    sectorName,
    proposalReference,
    projectName,
    projectDescription,
    totalFundingRequest,
    projectStatus,
    comments,
    score
  ) => {
    cy.url().should("include", "/form/0");
    cy.findByLabelText(/Operator Name/i).click();
    cy.contains(operatorName).click();
    cy.findByLabelText("Sector").click();
    cy.contains(sectorName).click();
    cy.findByLabelText(/Proposal Reference/i).type(proposalReference);
    cy.findByLabelText(/Project Name/i).type(projectName);
    cy.findByLabelText(/Score/i).type(score);
    cy.findByLabelText(/Project Description/i).type(projectDescription);
    cy.findByLabelText(/Total Funding Request/i).type(totalFundingRequest);
    cy.findByLabelText("Project Status").click();
    cy.contains(projectStatus).click();
    cy.findByLabelText(/General Comments/i).type(comments);
    // There is a bug where if cypress starts changing another form on the page too quickly,
    // the last change is discarded and rjsf throws an error.
    cy.contains("Changes saved");
  }
);

Cypress.Commands.add(
  "checkOverviewForm",
  (
    operatorName,
    proposalReference,
    projectName,
    projectDescription,
    totalFundingRequest,
    projectStatus,
    comments
  ) => {
    cy.findByLabelText(/Operator Name/i).should("have.value", operatorName);
    cy.findByLabelText(/Proposal Reference/i).should(
      "have.value",
      proposalReference
    );
    cy.findByLabelText(/Project Name/i).should("have.value", projectName);
    cy.findByLabelText(/Project Description/i).should(
      "have.value",
      projectDescription
    );

    cy.findByLabelText(/Total Funding Request/i).should(
      "have.value",
      totalFundingRequest
    );
    cy.findByLabelText(/Project Status/i).should("have.value", projectStatus);
    cy.findByLabelText(/General Comments/i).should("have.value", comments);
  }
);

Cypress.Commands.add(
  "fillManagersForm",
  (techTeamPrimary, techTeamSecondary, opsTeamPrimary) => {
    cy.url().should("include", "/form/1");

    cy.findByLabelText(/tech team primary/i).click();
    cy.contains(techTeamPrimary).click();
    cy.findByLabelText(/tech team secondary/i).click();
    cy.contains(techTeamSecondary).click();
    cy.findByLabelText(/ops team primary/i).click();
    cy.contains(opsTeamPrimary).click();

    cy.findByText(/Changes saved/i).should("be.visible");
    cy.contains("Changes saved");
  }
);

Cypress.Commands.add(
  "checkManagersForm",
  (techTeamPrimary, techTeamSecondary, opsTeamPrimary) => {
    cy.findByLabelText(/tech team primary/i).should(
      "have.value",
      techTeamPrimary
    );
    cy.findByLabelText(/tech team secondary/i).should(
      "have.value",
      techTeamSecondary
    );
    cy.findByLabelText(/ops team primary/i).should(
      "have.value",
      opsTeamPrimary
    );
  }
);

Cypress.Commands.add(
  "fillContactsForm",
  (
    primaryContact,
    primaryContactEmail,
    secondaryContact,
    secondaryContactEmail
  ) => {
    cy.url().should("include", "/form/2");

    cy.findByLabelText(/^Primary contact/i).click();
    cy.findAllByRole("option").contains(primaryContact).click();
    cy.findByText(primaryContactEmail).should("be.visible");

    cy.findByRole("button", { name: /add a secondary contact/i }).click();
    cy.findAllByRole("combobox").should("have.length", 2);
    cy.findByText(/^Secondary contact/i)
      .next()
      .findAllByRole("combobox")
      .click();
    cy.contains(secondaryContact).click();
    cy.findByText(secondaryContactEmail).should("be.visible");
  }
);

Cypress.Commands.add(
  "checkContactsForm",
  (primaryContact, secondaryContact) => {
    cy.findByLabelText(/primary contact/i).should("have.value", primaryContact);
    cy.get(`input[value="${secondaryContact}"]`).should("be.visible");
  }
);

Cypress.Commands.add(
  "addQuarterlyReport",
  (
    reportNumber,
    reportDueDate,
    reportReceivedDate = undefined,
    generalComments = undefined
  ) => {
    cy.get(".addButton").should("have.length", 1).click();
    cy.findByText(`Quarterly Report ${reportNumber}`).should("be.visible");

    cy.get('[aria-label*="Due Date"]').should("have.length", reportNumber);
    cy.setDateInPicker("Due Date", reportDueDate, reportNumber);

    if (reportReceivedDate) {
      cy.setDateInPicker("Received Date", reportReceivedDate, reportNumber);
    }

    if (generalComments) {
      cy.get('[aria-label="General Comments"]')
        .eq(reportNumber - 1)
        .type(generalComments);
      cy.get('[aria-label="General Comments"]')
        .eq(reportNumber - 1)
        .should("have.value", generalComments);
    }

    cy.contains("Changes saved").should("be.visible");
    // need to return a Cypress promise (could be any cy. command) to let Cypress know that it has to wait for this call
    return cy.url().should("include", "/form/6");
  }
);

Cypress.Commands.add(
  "addProjectSummaryReport",
  (
    reportDueDate,
    receivedDate,
    comments,
    projectSummaryReportPayment,
    paymentNotes,
    dateSentToCsnr
  ) => {
    cy.contains(/Status of Project Summary Report/i).should("be.visible");

    cy.setDateInPicker("Report Due Date", reportDueDate);

    if (receivedDate) {
      cy.setDateInPicker("Received Date", receivedDate);
    }

    if (comments) {
      cy.get('[aria-label="General Comments"]').clear().type(comments);
      cy.get('[aria-label="General Comments"]').should("have.value", comments);
    }

    if (projectSummaryReportPayment) {
      cy.get('[aria-label="Project Summary Report Payment"]')
        .clear()
        .type(projectSummaryReportPayment);
      cy.get('[aria-label="Project Summary Report Payment"]').should(
        "have.value",
        projectSummaryReportPayment
      );
    }

    if (paymentNotes) {
      cy.get('[aria-label="Notes for the Payment"]').clear().type(paymentNotes);
      cy.get('[aria-label="Notes for the Payment"]').should(
        "have.value",
        paymentNotes
      );
    }

    if (dateSentToCsnr) {
      cy.setDateInPicker("Date Invoice Sent to CSNR", dateSentToCsnr);
    }
    return cy.url().should("include", "/form/5");
  }
);

Cypress.Commands.add(
  "checkProjectSummaryReport",
  (
    reportDueDate,
    receivedDate,
    comments,
    projectSummaryReportPayment,
    paymentNotes,
    dateSentToCsnr
  ) => {
    cy.contains(/Report Due Date/i)
      .next()
      .contains(reportDueDate);

    if (receivedDate) {
      cy.contains("Received Date").next().contains(receivedDate);
    }

    if (comments) {
      cy.contains("General Comments").next().should("have.text", comments);
    }

    if (projectSummaryReportPayment) {
      cy.contains("Project Summary Report Payment")
        .next()
        .should("have.text", projectSummaryReportPayment);
    }

    if (paymentNotes) {
      cy.contains("Notes for the Payment")
        .next()
        .should("have.text", paymentNotes);
    }

    if (dateSentToCsnr) {
      cy.contains("Date Invoice Sent to CSNR").next().contains(dateSentToCsnr);
    }
  }
);

Cypress.Commands.add(
  "addOrEditEmissionIntensityReport",
  (
    measurementPeriodStartDate,
    measurementPeriodEndDate,
    emissionFunctionalUnit,
    baselineEmissionIntensity,
    targetEmissionIntensity,
    postProjectEmissionIntensity,
    productionFunctionalUnit,
    adjustedEmissionsIntensityPerformance
  ) => {
    // Extra assertion to wait for the new milestone report to be added
    cy.contains("Changes saved").should("be.visible");

    cy.setDateInPicker("TEIMP Start Date", measurementPeriodStartDate);
    cy.setDateInPicker("TEIMP End Date", measurementPeriodEndDate);
    cy.get('[aria-label="Functional Unit"]')
      .clear()
      .type(emissionFunctionalUnit);

    if (productionFunctionalUnit)
      cy.get('[aria-label="Production Functional Unit"]')
        .clear()
        .type(productionFunctionalUnit);

    cy.get('[aria-label="Baseline Emission Intensity (BEI)"]')
      .clear()
      .type(baselineEmissionIntensity);
    cy.get('[aria-label="Target Emission Intensity (TEI)"]')
      .clear()
      .type(targetEmissionIntensity);
    cy.get('[aria-label*="Post-Project Emission Intensity (PEI)"]')
      .clear()
      .type(postProjectEmissionIntensity);

    cy.findAllByText(
      `${emissionFunctionalUnit}${
        productionFunctionalUnit ? `/${productionFunctionalUnit}` : ""
      }`
    ).should("have.length", 3);

    if (adjustedEmissionsIntensityPerformance)
      cy.get('[aria-label="GHG Emission Intensity Performance (Adjusted)"]')
        .clear()
        .type(adjustedEmissionsIntensityPerformance);

    return cy.url().should("include", "/form/5");
  }
);

Cypress.Commands.add(
  "addAnnualReport",
  (
    reportNumber,
    reportDueDate,
    reportReceivedDate = undefined,
    generalComments = undefined
  ) => {
    cy.findByRole("button", {
      name: /Add another annual report/i,
    }).click();
    cy.get('[aria-label*="Due Date"]').should("have.length", reportNumber);
    cy.setDateInPicker("Due Date", reportDueDate, reportNumber);

    if (reportReceivedDate) {
      cy.setDateInPicker("Received Date", reportReceivedDate, reportNumber);
    }

    if (generalComments) {
      cy.get('[aria-label="General Comments"]')
        .eq(reportNumber - 1)
        .type(generalComments);
      cy.get('[aria-label="General Comments"]')
        .eq(reportNumber - 1)
        .should("have.value", generalComments);
    }
    // need to return a Cypress promise (could be any cy. command) to let Cypress know that it has to wait for this call
    return cy.url().should("include", "/form/7");
  }
);

Cypress.Commands.add(
  "addMilestoneReport",
  (
    reportNumber,
    reportDescription,
    reportType,
    reportSubstantialCompletionDate,
    professionalDesignation,
    reportMaxAmount = undefined,
    receivedDate = undefined,
    dateSentToCsnr = undefined
  ) => {
    cy.findByRole("button", {
      name: /Add another milestone report/i,
    }).click();

    // Extra assertion to wait for the new milestone report to be added
    cy.contains("Changes saved").should("be.visible");
    cy.findByRole("link", { name: /edit milestone/i }).should("be.visible");
    cy.findByText(`Milestone ${reportNumber}`).should("be.visible");

    cy.get('[aria-label="Milestone Description"]')
      .clear()
      .type(reportDescription);
    cy.get('[aria-label="Milestone Description"]').should(
      "have.value",
      reportDescription
    );

    cy.get('[placeholder="Select a Milestone Type"]').clear().type(reportType);
    cy.get('[placeholder="Select a Milestone Type"]').should(
      "have.value",
      reportType
    );

    if (reportMaxAmount) {
      cy.get('[aria-label="Maximum Amount This Milestone"]').type(100);
      cy.get('[aria-label="Total Eligible Expenses"]').type(100);
    }

    cy.setDateInPicker(
      "Substantial Completion Date",
      reportSubstantialCompletionDate
    );

    cy.findByLabelText("Professional Designation (optional)").click();
    cy.contains(professionalDesignation).click();

    if (receivedDate) {
      cy.setDateInPicker("Report Received Date", receivedDate, reportNumber);
    }
    if (dateSentToCsnr) {
      cy.setDateInPicker(
        "Date Invoice Sent to CSNR",
        dateSentToCsnr,
        reportNumber
      );
    }

    // need to return a Cypress promise (could be any cy. command) to let Cypress know that it has to wait for this call
    return cy.url().should("include", "/form/4");
  }
);

Cypress.Commands.add(
  "fillFundingAgreementForm",
  (
    maxFundingAmount,
    provinceSharePercentage,
    anticipatedFundingAmount,
    proponentCost,
    contractStartDate,
    projectAssetsLifeEndDate,
    holdbackPercentage = undefined
  ) => {
    cy.findByLabelText(/Maximum Funding Amount$/i)
      .clear()
      .type(maxFundingAmount);
    cy.findByLabelText(/Province's Share Percentage$/i)
      .clear()
      .type(provinceSharePercentage);
    // holdback percentage is for EP projects only
    if (holdbackPercentage) {
      cy.findByLabelText(/Performance Milestone Holdback Percentage$/i)
        .clear()
        .type(holdbackPercentage);
    }
    cy.findByLabelText(/Anticipated\/Actual Funding Amount$/i)
      .clear()
      .type(anticipatedFundingAmount);
    cy.findByLabelText(/Proponent Cost$/i)
      .clear()
      .type(proponentCost);
    cy.setDateInPicker("Contract Start Date", contractStartDate);
    cy.setDateInPicker(
      "Project Assets Life End Date",
      projectAssetsLifeEndDate
    );
    cy.contains("Changes saved");

    return cy.url().should("include", "/form/3");
  }
);

Cypress.Commands.add(
  "checkFundingAgreementForm",
  (
    summaryPageMode,
    maxFundingAmount,
    provinceSharePercentage,
    proponentCost,
    proponentsSharePercentage,
    contractStartDate,
    projectAssetsLifeEndDate,
    anticipatedFundingAmount,
    totalProjectValue,
    holdbackPercentage
  ) => {
    cy.findByText(/Maximum Funding Amount$/i)
      .next()
      .should("have.text", maxFundingAmount);
    cy.findByText(/Province's Share Percentage$/i)
      .next()
      .should("have.text", provinceSharePercentage);
    cy.findByText(/Proponent Cost$/i)
      .next()
      .should("have.text", proponentCost);
    cy.findByText(/Proponent's Share Percentage$/i)
      .next()
      .should("have.text", proponentsSharePercentage);
    cy.findByText(/Contract Start Date$/i)
      .next()
      .contains(contractStartDate);
    cy.findByText(/Project Assets Life End Date$/i)
      .next()
      .contains(projectAssetsLifeEndDate);
    cy.findByText(/Anticipated\/Actual Funding Amount$/i)
      .next()
      .should("have.text", anticipatedFundingAmount);
    cy.findByText(/Total Project Value$/i)
      .next()
      .should("have.text", totalProjectValue);
    if (holdbackPercentage) {
      cy.findByText(/Performance Milestone Holdback Percentage$/i)
        .next()
        .should("have.text", holdbackPercentage);
    }
    if (!summaryPageMode) return cy.url().should("include", "/form/3");
  }
);

Cypress.Commands.add(
  "happoAndAxe",
  (componentName, variant, axeContext, enableTempRules = false) => {
    const tempRules = {
      rules: {
        dlitem: { enabled: false },
        "definition-list": { enabled: false },
      },
    };

    cy.get("body").happoScreenshot({
      component: componentName,
      variant: variant,
    });
    cy.injectAxe();
    cy.checkA11y(axeContext, enableTempRules ? tempRules : null, logAxeResults);
  }
);

Cypress.Commands.add(
  "fillAdditionalFundingSourceForm",
  (source, amount, status, sourceNumber) => {
    cy.url().should("include", "/form/3");

    cy.get('[aria-label="Additional Funding Source"]')
      .eq(sourceNumber - 1)
      .clear()
      .type(source);
    cy.get('[aria-label="Additional Funding Amount"]')
      .eq(sourceNumber - 1)
      .clear()
      .type(amount);
    cy.findAllByText(/Additional Funding Status/i)
      .eq(sourceNumber - 1)
      .next()
      .findAllByRole("combobox")
      .click();
    cy.contains(status).click();
  }
);

Cypress.Commands.add(
  "checkAdditionalFundingSourceForm",
  (source, amount, status, sourceNumber) => {
    cy.url().should("include", "/form/3");

    cy.findAllByText(/^Additional Funding Source/i)
      .eq(sourceNumber - 1)
      .next()
      .should("have.text", source);
    cy.findAllByText(/^Additional Funding Amount/i)
      .eq(sourceNumber - 1)
      .next()
      .should("have.text", amount);
    cy.findAllByText(/^Additional Funding Status/i)
      .eq(sourceNumber - 1)
      .next()
      .should("have.text", status);
  }
);

Cypress.Commands.add("setDateInPicker", (ariaLabel, date, reportNumber = 0) => {
  const receivedDate = DateTime.fromFormat(date, "yyyy-MM-dd");

  const receivedDateTZ = receivedDate
    .setZone("America/Vancouver")
    .setLocale("en-CA")
    .set({
      day: receivedDate.get("day"),
      month: receivedDate.get("month"),
      year: receivedDate.get("year"),
    });
  cy.get(`[aria-label*="${ariaLabel}"]`)
    .eq(reportNumber - 1)
    .should("be.visible")
    .click();
  cy.get(".react-datepicker__month-select")
    // datepicker indexes months from 0, luxon indexes from 1
    .select(receivedDateTZ.get("month") - 1);
  cy.get(".react-datepicker__year-select").select(
    receivedDateTZ.get("year").toString()
  );
  cy.get(`.react-datepicker__day--0${receivedDateTZ.toFormat("dd")}`)
    .not(`.react-datepicker__day--outside-month`)
    .click();
  cy.get(`[aria-label*="${ariaLabel}"]`)
    .eq(reportNumber - 1)
    .contains(`${receivedDateTZ.toFormat("MMM dd, yyyy")}`);
  cy.contains("Changes saved").should("be.visible");
});

Cypress.Commands.add("navigateToFirstProjectEditRevisionPage", () => {
  cy.visit("/cif/projects");
  cy.get("button").contains("View").first().as("firstViewButton");
  cy.get("@firstViewButton").click();
  cy.findByText(/Amendments & Other Revisions/i).click();
  cy.url().should("include", "/project-revision-change-logs");
  cy.get("h2").contains(/Amendments & Other Revisions/i);
  cy.findAllByRole("button", { name: /^view \/ edit/i })
    .first()
    .click();
  cy.url().should("include", "/edit");
});

Cypress.Commands.add(
  "checkEmissionIntensityReportSummaryForm",
  (
    measurementPeriodStartDate,
    measurementPeriodEndDate,
    duration,
    emissionFunctionalUnit,
    productionFunctionalUnit,
    baselineEmissionIntensity,
    targetEmissionIntensity,
    postProjectEmissionIntensity,
    totalLifetimeEmissionReduction,
    ghgEmissionIntensityPerformance,
    adjustedGhgEmissionIntensityPerformance,
    dateSentToCsnr,
    paymentPercentageOfPerformanceMilestoneAmount,
    actualPerformanceMilestoneAmount,
    maximumPerformanceMilestoneAmount
  ) => {
    cy.contains("TEIMP Start Date").next().contains(measurementPeriodStartDate);
    cy.contains("TEIMP End Date").next().contains(measurementPeriodEndDate);
    if (duration) cy.contains(`Duration: ${duration}`);
    cy.contains("Functional Unit").next().contains(emissionFunctionalUnit);
    if (productionFunctionalUnit)
      cy.contains("Production Functional Unit")
        .next()
        .contains(productionFunctionalUnit);
    cy.contains("Baseline Emission Intensity (BEI)")
      .next()
      .contains(baselineEmissionIntensity);
    cy.contains("Target Emission Intensity (TEI)")
      .next()
      .contains(targetEmissionIntensity);

    if (postProjectEmissionIntensity)
      cy.contains("Post-Project Emission Intensity (PEI)")
        .next()
        .contains(postProjectEmissionIntensity);

    if (totalLifetimeEmissionReduction)
      cy.contains("Total Project Lifetime Emissions Reductions")
        .next()
        .contains(totalLifetimeEmissionReduction);
    cy.findByText("GHG Emission Intensity Performance")
      .next()
      .contains(ghgEmissionIntensityPerformance);
    cy.findByText("GHG Emission Intensity Performance (Adjusted)")
      .next()
      .contains(adjustedGhgEmissionIntensityPerformance);

    if (dateSentToCsnr)
      cy.contains("Date Invoice Sent to CSNR").next().contains(dateSentToCsnr);
    cy.contains("Payment Percentage of Performance Milestone Amount")
      .next()
      .contains(paymentPercentageOfPerformanceMilestoneAmount);

    cy.contains("Actual Performance Milestone Amount")
      .next()
      .contains(actualPerformanceMilestoneAmount);
    cy.contains("Maximum Performance Milestone Amount")
      .next()
      .contains(maximumPerformanceMilestoneAmount);
  }
);

Cypress.Commands.add(
  "checkEmissionIntensityReportForm",
  ({
    measurementPeriodStartDate,
    measurementPeriodEndDate,
    duration,
    emissionFunctionalUnit,
    productionFunctionalUnit,
    baselineEmissionIntensity,
    targetEmissionIntensity,
    postProjectEmissionIntensity,
    totalLifetimeEmissionReduction,
    ghgEmissionIntensityPerformance,
    adjustedGhgEmissionIntensityPerformance,
    dateSentToCsnr,
    paymentPercentageOfPerformanceMilestoneAmount,
    actualPerformanceMilestoneAmount,
    maximumPerformanceMilestoneAmount,
  }) => {
    cy.url().should("include", "/form/5");
    cy.get('[aria-label="TEIMP Start Date"]').should(
      "have.text",
      measurementPeriodStartDate
    );
    cy.get('[aria-label="TEIMP End Date"]').should(
      "have.text",
      measurementPeriodEndDate
    );
    if (duration) cy.contains(`Duration: ${duration}`);

    cy.get('[aria-label="Functional Unit"]').should(
      "have.value",
      emissionFunctionalUnit
    );

    cy.get('[aria-label="Production Functional Unit"]').should(
      "have.value",
      productionFunctionalUnit
    );

    cy.get('[aria-label="Baseline Emission Intensity (BEI)"]').should(
      "have.value",
      baselineEmissionIntensity
    );

    cy.get('[aria-label="Target Emission Intensity (TEI)"]').should(
      "have.value",
      targetEmissionIntensity
    );

    if (postProjectEmissionIntensity)
      cy.get('[aria-label="Post-Project Emission Intensity (PEI)"]').should(
        "have.value",
        postProjectEmissionIntensity
      );

    if (totalLifetimeEmissionReduction)
      cy.get(
        '[aria-label="Total Project Lifetime Emissions Reductions"]'
      ).should("have.value", totalLifetimeEmissionReduction);

    cy.contains("GHG Emission Intensity Performance")
      .next()
      .contains(ghgEmissionIntensityPerformance);
    cy.get(
      '[aria-label="GHG Emission Intensity Performance (Adjusted)"]'
    ).should("have.value", adjustedGhgEmissionIntensityPerformance);

    if (dateSentToCsnr)
      cy.get('[aria-label="Date Invoice Sent to CSNR"]').should(
        "have.text",
        dateSentToCsnr
      );
    cy.contains("Payment Percentage of Performance Milestone Amount")
      .next()
      .contains(paymentPercentageOfPerformanceMilestoneAmount);

    cy.contains("Actual Performance Milestone Amount")
      .next()
      .contains(actualPerformanceMilestoneAmount);
    cy.contains("Maximum Performance Milestone Amount")
      .next()
      .contains(maximumPerformanceMilestoneAmount);
  }
);
