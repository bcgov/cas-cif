import "cypress-file-upload";
import "happo-cypress";
import "@testing-library/cypress/add-commands";
import { DateTime } from "luxon";

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
  return cy.fixture(`${fixtureName}.sql`).then((fixture) =>
    cy.exec(`psql -v "ON_ERROR_STOP=1" -d cif<< 'EOF'
${fixture}
EOF`)
  );
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
    summary,
    totalFundingRequest,
    projectStatus,
    comments
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
    cy.findByLabelText(/Summary/i).type(summary);
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
    summary,
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
    cy.findByLabelText(/Summary/i).should("have.value", summary);

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

    // FIXME: adding project managers does not trigger the saving indicator
    cy.wait(1000);
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

Cypress.Commands.add("fillContactsForm", (primaryContact, secondaryContact) => {
  cy.url().should("include", "/form/2");

  cy.findByLabelText(/Primary contact/i).click();
  cy.contains(primaryContact).click();

  // TODO: figure out why we need to wait when setting the primary contact
  cy.wait(1000);
  cy.get("button").contains("Add").click();
  // TODO: figure out why we need to wait when setting the primary contact
  cy.wait(1000);
  cy.get("label")
    .contains("Secondary Contacts")
    .parent()
    .find("input")
    .last()
    .click();
  cy.contains(secondaryContact).click();
  // TODO: figure out why we need to wait when setting the primary contact
  cy.wait(1000);
});

Cypress.Commands.add(
  "checkContactsForm",
  (primaryContact, secondaryContact) => {
    cy.findByLabelText(/primary contact/i).should("have.value", primaryContact);
    cy.get(`input[value="${secondaryContact}"]`).should("be.visible");
  }
);

Cypress.Commands.add("addDueDate", (reportNumber, reportDueDate) => {
  const dueDate = DateTime.fromFormat(reportDueDate, "yyyy-MM-dd");
  const dueDateTZ = dueDate
    .setLocale("en-CA")
    .setZone("America/Vancouver")
    .set({
      day: dueDate.get("day"),
      month: dueDate.get("month"),
      year: dueDate.get("year"),
    });

  cy.get('[aria-label*="Due Date"]')
    .eq(reportNumber - 1)
    .should("exist")
    .click();
  cy.get(".react-datepicker__month-select")
    // datepicker indexes months from 0, luxon indexes from 1
    .select(dueDateTZ.get("month") - 1);
  cy.get(".react-datepicker__year-select").select(
    dueDateTZ.get("year").toString()
  );
  cy.get(`.react-datepicker__day--0${dueDateTZ.toFormat("dd")}`)
    .not(`.react-datepicker__day--outside-month`)
    .click();
  cy.get('[aria-label*="Due Date"]')
    .eq(reportNumber - 1)
    .contains(`${dueDateTZ.toFormat("MMM dd, yyyy")}`);
  cy.contains("Changes saved").should("be.visible");
  // need to return a Cypress promise (could be any cy. command) to let Cypress know that it has to wait for this call
  return cy.url().should("include", "/form");
});

Cypress.Commands.add(
  "setReportReceivedDate",
  (reportNumber, reportReceivedDate) => {
    const receivedDate = DateTime.fromFormat(reportReceivedDate, "yyyy-MM-dd")
      .setZone("America/Vancouver")
      .setLocale("en-CA");
    cy.get('[aria-label*="Received Date"]')
      .eq(reportNumber - 1)
      .should("exist")
      .click();
    cy.get(".react-datepicker__month-select")
      // datepicker indexes months from 0, luxon indexes from 1
      .select(receivedDate.get("month") - 1);
    cy.get(".react-datepicker__year-select").select(
      receivedDate.get("year").toString()
    );
    cy.get(`.react-datepicker__day--0${receivedDate.toFormat("dd")}`)
      .not(`.react-datepicker__day--outside-month`)
      .click();
    cy.get('[aria-label*="Received Date"]')
      .eq(reportNumber - 1)
      .should(
        "have.text",
        `Received(${receivedDate.toFormat("MMM dd, yyyy")})`
      );
    cy.contains("Changes saved").should("be.visible");
    // need to return a Cypress promise (could be any cy. command) to let Cypress know that it has to wait for this call
    return cy.url().should("include", "/form");
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
    cy.wait(1000);

    cy.contains(`Quarterly Report ${reportNumber}`).should("be.visible");
    cy.get('[aria-label*="Due Date"]').should("have.length", reportNumber);
    cy.addDueDate(reportNumber, reportDueDate);

    if (reportReceivedDate) {
      cy.setReportReceivedDate(reportNumber, reportReceivedDate);
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
    return cy.url().should("include", "/form/4");
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
    cy.addDueDate(reportNumber, reportDueDate);

    if (reportReceivedDate) {
      cy.setReportReceivedDate(reportNumber, reportReceivedDate);
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
      cy.get('[aria-label*="Enter Amount"]').click();
      cy.get('[aria-label="Maximum Milestone Amount"]').type(100);
    }

    cy.addDueDate(reportNumber, reportDueDate);

    cy.get('[aria-label*="Substantial Completion Date"').type(
      reportSubstantialCompletionDate
    );

    cy.get('[id*="certifierProfessionalDesignation"]').type(
      professionalDesignation
    );

    if (receivedDate) {
      cy.get('[label*="Received Date"]')
        .eq(reportNumber - 1)
        .type(receivedDate);
      cy.get('[label*="Received Date"]')
        .eq(reportNumber - 1)
        .should("have.value", receivedDate);
    }

    // need to return a Cypress promise (could be any cy. command) to let Cypress know that it has to wait for this call
    return cy.url().should("include", "/form/3");
  }
);
