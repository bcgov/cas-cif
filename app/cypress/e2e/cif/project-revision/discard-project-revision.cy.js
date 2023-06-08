describe("when discarding a project revision, the project page", () => {
  beforeEach(() => {
    cy.sqlFixture("e2e/dbReset");
    cy.sqlFixture("dev/001_cif_user");
    cy.sqlFixture("dev/002_cif_operator");
    cy.sqlFixture("dev/003_cif_contact");
    cy.sqlFixture("dev/004_cif_project");
    cy.sqlFixture("dev/007_commit_project_revision");
    cy.sqlFixture("dev/009_cif_project_revision_logs");
    cy.mockLogin("cif_admin");
  });

  it("discards a revision when the user clicks the Discard Revision button", () => {
    cy.navigateToFirstProjectEditRevisionPage();
    cy.findByText(/Amendment 2/i).should("be.visible");
    cy.findByText(/1. Project Overview/i).click();
    cy.findByText(/Edit Project Overview/i).click();
    cy.url().should("include", "/form/0");

    cy.findByLabelText(/Project Name/i)
      .should("have.value", "Test EP Project 001")
      .clear()
      .type("this will be discarded");
    cy.findByText(/submit/i).click();

    cy.findByRole("button", { name: /^discard/i }).click();
    cy.findByText("Proceed").click();

    cy.findByText(/Test EP Project 001/i).should("be.visible");
  });
});
