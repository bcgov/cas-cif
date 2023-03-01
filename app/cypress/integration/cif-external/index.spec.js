describe("the external projects page", () => {
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
    cy.visit("/cif-external");
    cy.contains("h2", "Welcome").should("be.visible");
    cy.get("tbody tr").should("have.length", 6);
    cy.happoAndAxe("External User", "External Projects", "main");
    cy.get("[placeholder='Filter']").first().type("EXTERNAL001");
    cy.get("button").contains("Apply").click();
    cy.get("tbody tr").should("have.length", 1);
    cy.get("button").contains("Clear").click();
    cy.get("tbody tr").should("have.length", 6);
    cy.get("thead th").contains("Project Name").click();
    cy.get("thead th").contains("Project Name").click();
    cy.contains("Test External Project 006");
  });
});
