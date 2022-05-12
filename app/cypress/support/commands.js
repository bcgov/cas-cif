import "cypress-file-upload";
import "happo-cypress";
import "@testing-library/cypress/add-commands";

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
    proposalReference,
    projectName,
    summary,
    totalFundingRequest,
    projectStatus
  ) => {
    cy.url().should("include", "/form/overview");
    cy.findByLabelText(/Funding Stream$/i).select(fundingStream);
    cy.findByLabelText(/Funding Stream RFP/i).select(fundingStreamYear);
    cy.findByLabelText(/Operator Name/i).click();
    cy.contains(operatorName).click();
    cy.findByLabelText(/Proposal Reference/i).type(proposalReference);
    cy.findByLabelText(/Project Name/i).type(projectName);
    cy.findByLabelText(/Summary/i).type(summary);
    cy.findByLabelText(/Total Funding Request/i).type(totalFundingRequest);
    cy.findByLabelText(/Project Status/i).select(projectStatus);
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
    projectStatus
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
  }
);

Cypress.Commands.add(
  "fillManagersForm",
  (techTeamPrimary, techTeamSecondary, opsTeamPrimary) => {
    cy.url().should("include", "/form/managers");

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
  cy.url().should("include", "/form/contacts");

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

Cypress.Commands.add(
  "addQuarterlyReport",
  (
    reportNumber,
    reportDueDate,
    receivedDate = undefined,
    generalComments = undefined
  ) => {
    cy.url().should("include", "/form/quarterly-reports");

    cy.findByRole("button", { name: /add another quarterly report/i }).click();
    cy.get('[label*="Due Date"]')
      .eq(reportNumber - 1)
      .type(reportDueDate);
    cy.get('[label*="Due Date"]')
      .eq(reportNumber - 1)
      .should("have.value", reportDueDate);

    if (receivedDate) {
      cy.get('[label*="Received Date"]')
        .eq(reportNumber - 1)
        .type(receivedDate);
      cy.get('[label*="Received Date"]')
        .eq(reportNumber - 1)
        .should("have.value", receivedDate);
    }

    if (generalComments) {
      cy.get('[aria-label="General Comments"]')
        .eq(reportNumber - 1)
        .type(generalComments);
      cy.get('[aria-label="General Comments"]')
        .eq(reportNumber - 1)
        .should("have.value", generalComments);
    }
    //TODO: figure out how to avoid this (currently needed when calling this function multiple times in a row)
    cy.wait(1000);
  }
);

Cypress.Commands.add(
  "checkContactsForm",
  (primaryContact, secondaryContact) => {
    cy.findByLabelText(/primary contact/i).should("have.value", primaryContact);
    cy.get(`input[value="${secondaryContact}"]`).should("be.visible");
  }
);
