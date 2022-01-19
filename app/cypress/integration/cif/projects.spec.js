import logAxeResults from "../../plugins/logAxeResults";

describe("the projects page", () => {
  beforeEach(() => {
    cy.sqlFixture("e2e/dbReset");
    cy.sqlFixture("dev/001_cif_user");
    cy.sqlFixture("dev/002_cif_operator");
    cy.sqlFixture("dev/003_cif_project");
    cy.mockLogin("cif_internal");
  });

  it("displays the list of projects", () => {
    cy.visit("/cif/projects");
    cy.get("h2").contains("Projects");
    cy.injectAxe();
    // TODO: the entire body should be tested for accessibility
    cy.checkA11y("main", null, logAxeResults);
    cy.get("body").happoScreenshot({
      component: "Projects Page",
    });
  });

  it("allows the list of projects to be paginated, filtered and ordered", () => {
    cy.visit("/cif/projects");
    cy.get("h2").contains("Projects");
    cy.get("tbody tr").should("have.length", 20);
    cy.get("[placeholder='Filter']").first().type("001");
    cy.get("button").contains("Apply").click();
    cy.get("tbody tr").should("have.length", 1);
    cy.get("button").contains("Clear").click();
    cy.get("tbody tr").should("have.length", 20);
    cy.get("button[title='Go to next page']").click();
    cy.contains("test project 021");
    // click twice for descending order
    cy.get("button[title='Go to first page']").click();
    cy.contains("test project 001");
    cy.get("thead th").contains("Project Name").click();
    cy.get("thead th").contains("Project Name").click();
    cy.contains("test project 050");
  });
});
