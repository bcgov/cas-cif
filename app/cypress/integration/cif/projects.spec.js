import logAxeResults from "../../plugins/logAxeResults";

describe("the projects page", () => {
  it("displays the list of projects", () => {
    cy.mockLogin("cif_internal");
    cy.visit("/cif/projects");
    cy.get("h2").contains("Projects");
    cy.injectAxe();
    // TODO: the entire body should be tested for accessibility
    cy.checkA11y("main", null, logAxeResults);
    cy.get("body").happoScreenshot({
      component: "Projects Page",
    });
  });
});
