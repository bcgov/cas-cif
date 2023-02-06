import logAxeResults from "../../plugins/logAxeResults";

describe("the projects page", () => {
  beforeEach(() => {
    cy.useMockedTime(new Date("June 10, 2020 09:00:00"));
    cy.sqlFixture("e2e/dbReset");
    cy.sqlFixture("dev/001_cif_user");
    cy.sqlFixture("dev/002_cif_operator");
    cy.sqlFixture("dev/003_cif_contact");
    cy.sqlFixture("dev/004_cif_project");
    cy.sqlFixture("dev/007_commit_project_revision");
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
    cy.get("[placeholder='Filter']").first().type("EP 001");
    cy.get("button").contains("Apply").click();
    cy.get("tbody tr").should("have.length", 1);
    cy.get("button").contains("Clear").click();
    cy.get("tbody tr").should("have.length", 20);
    cy.get("button[title='Go to next page']").click();
    cy.contains("Test EP Project 021");
    // click twice for descending order
    cy.get("button[title='Go to first page']").click();
    cy.contains("Test EP Project 001");
    cy.get("thead th").contains("Project Name").click();
    cy.get("thead th").contains("Project Name").click();
    cy.contains("Test EP Project 050");
  });
});
