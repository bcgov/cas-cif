/*
  This set of e2e tests test the real login function,
  and doesn't mock the login
  There are suspected side-effects causing subsequent tests to encounter flaky failures,
  so this test suite should be run last (hence the file name starting with zz)
*/

describe("When logged in as an unauthorized user", () => {
  before(() => {
    cy.sqlFixture("e2e/dbReset");
    cy.sqlFixture("dev/001_cif_user");
  });

  afterEach(() => cy.logout());

  it("The user should be redirected to the unauthorized_idir page", () => {
    cy.login(
      Cypress.env("TEST_UNAUTHORIZED_USERNAME"),
      Cypress.env("TEST_UNAUTHORIZED_PASSWORD")
    )
      .its("redirects")
      .should((redirects) => {
        expect(redirects[redirects.length - 1]).to.contain(
          "/unauthorized_idir"
        );
      });
    cy.visit("/");
    cy.get("button").contains("Log out");
  });
});

describe("When logged in as an analyst", () => {
  afterEach(() => cy.logout());

  it("The index page redirects to the analyst dashboard", () => {
    cy.login(
      Cypress.env("TEST_INTERNAL_USERNAME"),
      Cypress.env("TEST_INTERNAL_PASSWORD")
    )
      .its("redirects")
      .should((redirects) => {
        expect(redirects[redirects.length - 1]).to.contain("/cif");
      });
    cy.visit("/");
    cy.get("button").contains("Log out");
    cy.get("header").contains("Analyst, Test");
    cy.get("h2").contains("Welcome, Test");
  });
});

describe("When logged in as an admin", () => {
  afterEach(() => cy.logout());

  it("The index page redirects to the admin dashboard", () => {
    cy.login(
      Cypress.env("TEST_ADMIN_USERNAME"),
      Cypress.env("TEST_ADMIN_PASSWORD")
    )
      .its("redirects")
      .should((redirects) => {
        expect(redirects[redirects.length - 1]).to.contain("/cif");
      });
    cy.visit("/");
    cy.contains("Administration");
    cy.get("button").contains("Log out");
    cy.get("header").contains("Admin, Test");
    cy.get("h2").contains("Welcome, Test");
  });
});
