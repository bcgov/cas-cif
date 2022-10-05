describe("the project amendment and revisions page", () => {
  beforeEach(() => {
    cy.useMockedTime(new Date("June 10, 2020 09:00:00"));
    cy.sqlFixture("e2e/dbReset");
    cy.sqlFixture("dev/001_cif_user");
    cy.sqlFixture("dev/002_cif_operator");
    cy.sqlFixture("dev/003_cif_contact");
    cy.sqlFixture("dev/004_cif_project");
    cy.sqlFixture("dev/007_commit_project_revision");
    cy.sqlFixture("dev/009_cif_project_revision_logs");
    cy.mockLogin("cif_admin");
  });

  it("displays the list of project amendment and revisions", () => {
    cy.visit("/cif/projects");
    cy.findAllByRole("button", { name: /view/i }).first().click();
    cy.findByText(/Amendments & Other Revisions/i).click();
    cy.url().should("include", "/project-revision-change-logs");
    cy.get("h2").contains(/Amendments & Other Revisions/i);
    cy.happoAndAxe("Amendments & Other Revisions", "view", "main");
    cy.get("tbody tr").should("have.length", 5);
    cy.get("[placeholder='Filter']").first().type("Minor");
    cy.get("button").contains("Apply").click();
    cy.get("tbody tr").should("have.length", 1);
    cy.get("button").contains("Clear").click();
    cy.get("tbody tr").should("have.length", 5);
    // below code is not a duplicate, we need to click the field twice to get the DESC sort
    cy.get("thead th").contains("Type").click();
    cy.get("thead th").contains("Type").click();

    cy.url().should("include", "orderBy=REVISION_TYPE_DESC"); //just to wait for the page to load
    cy.get("tbody tr").first().contains("Minor Revision");
    cy.get("tbody tr").last().contains("In Discussion");
  });
});
