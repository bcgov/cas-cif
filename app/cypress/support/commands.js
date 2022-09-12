import "cypress-file-upload";
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
  "fillOverviewForm",
  (
    fundingStream,
    fundingStreamYear,
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
    cy.findByLabelText(/Funding Stream$/i).select(fundingStream);
    cy.findByLabelText(/Funding Stream RFP/i).select(fundingStreamYear);
    cy.findByLabelText(/Operator Name/i).click();
    cy.contains(operatorName).click();
    cy.findByLabelText("Sector").click();
    cy.contains(sectorName).click();
    cy.findByLabelText(/Proposal Reference/i).type(proposalReference);
    cy.findByLabelText(/Project Name/i).type(projectName);
    cy.findByLabelText(/Score/i).type(score);
    cy.findByLabelText(/Project Description/i).type(projectDescription);
    cy.findByLabelText(/Total Funding Request/i).type(totalFundingRequest);
    cy.findByLabelText(/Project Status/i).select(projectStatus);
    cy.findByLabelText(/General Comments/i).type(comments);
    // There is a bug where if cypress starts changing another form on the page too quickly,
    // the last change is discarded and rjsf throws an error.
    cy.contains("Changes saved");
  }
);

Cypress.Commands.add(
  "checkOverviewForm",
  (
    fundingStream,
    fundingStreamYear,
    operatorName,
    proposalReference,
    projectName,
    projectDescription,
    totalFundingRequest,
    projectStatus,
    comments
  ) => {
    cy.get("option").contains(fundingStream).should("be.selected");
    cy.get("option").contains(fundingStreamYear).should("be.selected");
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
    cy.get("option").contains(projectStatus).should("be.selected");
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
    cy.findByRole("button", {
      name: /add another quarterly report/i,
    }).click();
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
    // need to return a Cypress promise (could be any cy. command) to let Cypress know that it has to wait for this call
    return cy.url().should("include", "/form/5");
  }
);

Cypress.Commands.add(
  "addEmissionIntensityReport",
  (
    measurementPeriodStartDate,
    measurementPeriodEndDate,
    emissionFunctionalUnit,
    productionFunctionalUnit = undefined,
    baselineEmissionIntensity,
    targetEmissionIntensity,
    postProjectEmissionIntensity
  ) => {
    // Extra assertion to wait for the new milestone report to be added
    cy.contains("Changes saved").should("be.visible");

    cy.setDateInPicker(
      "Measurement period start date",
      measurementPeriodStartDate
    );
    cy.setDateInPicker("Measurement period end date", measurementPeriodEndDate);
    cy.get('[aria-label="Functional Unit"]')
      .clear()
      .type(emissionFunctionalUnit);

    if (productionFunctionalUnit)
      cy.get('[aria-label="Production Functional Unit"]')
        .clear()
        .type(productionFunctionalUnit);

    cy.get('[aria-label="Base Line Emission Intensity (BEI)"]')
      .clear()
      .type(baselineEmissionIntensity);
    cy.get('[aria-label="Target Emission Intensity (TEI)"]')
      .clear()
      .type(targetEmissionIntensity);
    cy.get('[aria-label*="Post Project Emission Intensity"]')
      .clear()
      .type(postProjectEmissionIntensity);

    cy.findAllByText(
      `${emissionFunctionalUnit}${
        productionFunctionalUnit ? `/${productionFunctionalUnit}` : ""
      }`
    ).should("have.length", 3);

    return cy.url().should("include", "/form/6");
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
    reportDueDate,
    reportSubstantialCompletionDate,
    professionalDesignation,
    reportMaxAmount = undefined,
    receivedDate = undefined
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

    cy.get('[placeholder="Select a Milestone Type"]').type(reportType);
    cy.get('[placeholder="Select a Milestone Type"]').should(
      "have.value",
      reportType
    );

    if (reportMaxAmount) {
      cy.get('[aria-label="Maximum Amount"]').type(100);
      cy.get('[aria-label="Total Eligible Expenses"]').type(100);
    }

    cy.setDateInPicker("Due Date", reportDueDate, reportNumber);

    cy.get('[aria-label*="Substantial Completion Date"').type(
      reportSubstantialCompletionDate
    );

    cy.findByLabelText("Professional Designation (optional)").click();
    cy.contains(professionalDesignation).click();

    if (receivedDate) {
      cy.get('[label*="Received Date"]')
        .eq(reportNumber - 1)
        .type(receivedDate);
      cy.get('[label*="Received Date"]')
        .eq(reportNumber - 1)
        .should("have.value", receivedDate);
    }

    // need to return a Cypress promise (could be any cy. command) to let Cypress know that it has to wait for this call
    return cy.url().should("include", "/form/4");
  }
);

Cypress.Commands.add(
  "fillFundingAgreementForm",
  (
    totalProjectValue,
    maxFundingAmount,
    provinceSharePercentage,
    holdbackPercentage,
    anticipatedFundingAmount,
    proponentCost,
    contractStartDate,
    projectAssetsLifeEndDate
  ) => {
    cy.findByLabelText(/Total Project Value$/i)
      .clear()
      .type(totalProjectValue);
    cy.findByLabelText(/Max Funding Amount$/i)
      .clear()
      .type(maxFundingAmount);
    cy.findByLabelText(/Province Share Percentage$/i)
      .clear()
      .type(provinceSharePercentage);
    cy.findByLabelText(/Holdback Percentage$/i)
      .clear()
      .type(holdbackPercentage);
    cy.findByLabelText(/Anticipated Funding Amount$/i)
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
    totalProjectValue,
    maxFundingAmount,
    provinceSharePercentage,
    holdbackPercentage,
    anticipatedFundingAmount,
    proponentCost,
    contractStartDate,
    projectAssetsLifeEndDate,
    summaryPageMode = false
  ) => {
    cy.findByText(/Total Project Value$/i)
      .next()
      .should("have.text", totalProjectValue);
    cy.findByText(/Max Funding Amount$/i)
      .next()
      .should("have.text", maxFundingAmount);
    cy.findByText(/Province Share Percentage$/i)
      .next()
      .should("have.text", provinceSharePercentage);
    cy.findByText(/Holdback Percentage$/i)
      .next()
      .should("have.text", holdbackPercentage);
    cy.findByText(/Anticipated Funding Amount$/i)
      .next()
      .should("have.text", anticipatedFundingAmount);
    cy.findByText(/Proponent Cost$/i)
      .next()
      .should("have.text", proponentCost);

    cy.findByText(/Contract Start Date$/i)
      .next()
      .contains(contractStartDate);
    cy.findByText(/Project Assets Life End Date$/i)
      .next()
      .contains(projectAssetsLifeEndDate);
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
    .should("exist")
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
