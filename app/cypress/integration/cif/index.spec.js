import logAxeResults from "../../plugins/logAxeResults";

describe("The CIF dashboard page", () => {
  it("renders for a logged in CIF internal user", () => {
    cy.mockLogin("cif_internal");
    cy.visit("/cif");
    cy.get("h2").contains("Welcome");
    cy.injectAxe();
    // TODO: the entire body should be tested for accessibility
    cy.checkA11y("main", null, logAxeResults);
    cy.get("body").happoScreenshot({
      component: "CIF dashboard",
      variant: "cif_internal",
    });
  });

  it("renders for a logged in CIF admin user", () => {
    cy.mockLogin("cif_admin");
    cy.visit("/cif");
    cy.get("h2").contains("Welcome");
    cy.injectAxe();
    // TODO: the entire body should be tested for accessibility
    cy.checkA11y("main", null, logAxeResults);
    cy.get("body").happoScreenshot({
      component: "CIF dashboard",
      variant: "cif_admin",
    });
  });
});
