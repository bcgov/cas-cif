import logAxeResults from "../../../plugins/logAxeResults";

describe("the new project page", () => {
  it("renders the project overview form", () => {
    cy.mockLogin("cif_admin");
    cy.visit("/cif/projects");
    cy.get("button").contains("Add a Project").click();
    cy.url().should("include", "/cif/project-revision");
    cy.get("button").contains("Submit");
    cy.injectAxe();
    // TODO: the entire body should be tested for accessibility
    cy.checkA11y("main", null, logAxeResults);
    cy.get("body").happoScreenshot({
      component: "New Project Page",
      variant: "empty",
    });
  });
});
