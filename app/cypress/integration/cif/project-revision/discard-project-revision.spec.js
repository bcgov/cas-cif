describe("when discarding a project revision, the project page", () => {
  beforeEach(() => {
    cy.sqlFixture("e2e/dbReset");
    cy.sqlFixture("dev/001_cif_user");
    cy.sqlFixture("dev/002_cif_operator");
    cy.sqlFixture("dev/003_cif_contact");
    cy.sqlFixture("dev/004_cif_project");
    cy.sqlFixture("dev/007_commit_project_revision");
  });

  it("discards a revision when the user clicks the Discard Revision button", () => {
    cy.mockLogin("cif_admin");
    cy.visit("/cif/projects");
    cy.findAllByRole("button", { name: /view/i }).first().click();
    cy.findByRole("button", { name: /edit/i }).click();
    cy.findByLabelText(/Project Name/i)
      .should("have.value", "Test Project 001")
      .clear()
      .type("this will be discarded");
    cy.findByText(/Submit Changes/i).click();

    cy.findByText(/Review and Submit information/i).click();
    cy.contains("Review and Submit Project").should("be.visible");
    cy.findByRole("button", { name: /^discard/i }).click();
    cy.findByText("Proceed").click();

    cy.findByText(/Test Project 001/i).should("be.visible");
  });
});
