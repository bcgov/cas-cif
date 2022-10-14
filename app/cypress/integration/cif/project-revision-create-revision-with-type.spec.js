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
    cy.findByRole("button", { name: /Edit/i }).click();
    cy.findByRole("button", { name: /Submit Changes/i }).click();
    cy.findByText(/Review and submit information/i).click();
    cy.findByRole("button", { name: /Discard Project Revision/i }).click();
    cy.findByText(/Proceed/i).click();

    cy.findByText(/Amendments & Other Revisions/i).click();
    cy.findByText(/New Revision/i).click();
    cy.url().should("include", "/project-revision-create");
    cy.happoAndAxe("Project Revision Create", "view", "main");
    cy.get("form").contains("Amendment", { matchCase: false });
    cy.get("form").contains("General Revision", { matchCase: false });
    cy.get("form").contains("Minor Revision", { matchCase: false });
    cy.get("button").contains("New Revision").click();
    cy.url().should("include", "/form/0");
  });
});
