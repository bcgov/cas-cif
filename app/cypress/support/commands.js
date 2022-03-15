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
