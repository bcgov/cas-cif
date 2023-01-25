describe("the project amendment and revisions page", () => {
  beforeEach(() => {
    cy.useMockedTime(new Date("June 10, 2020 09:00:00"));
    cy.sqlFixture("e2e/dbReset");
    cy.sqlFixture("dev/001_cif_user");
    cy.sqlFixture("dev/002_cif_operator");
    cy.sqlFixture("dev/003_cif_contact");
    cy.sqlFixture("dev/004_cif_project");
    cy.sqlFixture("dev/007_commit_project_revision");
    cy.mockLogin("cif_admin");
  });

  it("displays the list of project amendment and revisions", () => {
    cy.visit("/cif/projects");
    cy.findAllByRole("button", { name: /view/i }).first().click();
    cy.findByText(/Amendments & Other Revisions/i).click();
    cy.findByText(/New Revision/i).click();
    cy.url().should("include", "/create");
    cy.get("form").contains("Amendment", { matchCase: false });
    cy.get("form").contains("General Revision", { matchCase: false });
    cy.get("form").contains("Minor Revision", { matchCase: false });
    cy.happoAndAxe("Project Revision Create", "view", "main");
    cy.get('[type="radio"]').check("Amendment");
    cy.get(".checkbox").contains("Scope").click();
    cy.get("button").contains("New Revision").click();
    cy.url().should("include", "/form/0");
  });
  it("displays updated forms in a project revision/amendment", () => {
    cy.visit("/cif/projects");
    cy.findAllByRole("button", { name: /view/i }).first().click();
    cy.findByText(/Amendments & Other Revisions/i).click();
    cy.findByText(/New Revision/i).click();
    cy.url().should("include", "/create");
    cy.get('[type="radio"]').check("General Revision");
    cy.get("button").contains("New Revision").click();
    cy.url().should("include", "/form/0");

    // edit overview -- change project name
    cy.findByLabelText(/project name/i)
      .should("have.value", "Test Project 001")
      .clear()
      .type("Bar");
    cy.contains("Changes saved.");
    cy.findByRole("button", { name: /^submit/i }).click();

    // edit managers -- delete a manager
    cy.contains("Review and Submit Project");
    cy.findByText(/project details/i).click();
    cy.findByText(/edit project managers/i).click();
    cy.url().should("include", "/form/1");
    cy.get("label")
      .contains(/tech team primary/i)
      .next()
      .find("button")
      .contains("Clear")
      .click();
    cy.findByLabelText(/tech team primary/i).should("be.empty");

    cy.contains("Changes saved.").should("be.visible");
    cy.findByRole("button", { name: /^submit/i }).click();

    // edit contacts -- add a secondary contact
    cy.contains("Review and Submit Project");
    cy.findByText(/project details/i).click();
    cy.findByText(/edit project contacts/i).click();
    cy.url().should("include", "/form/2");

    cy.findByLabelText(/primary contact/i).click();
    cy.contains("Loblaw003").click();

    cy.contains("Changes saved.").should("be.visible");
    cy.findByLabelText(/primary contact/i).should(
      "have.value",
      "Bob003 Loblaw003"
    );
    cy.contains("Changes saved.").should("be.visible");
    cy.findByRole("button", { name: /^submit/i }).click();

    //current flow for reaching to the project amendment/revision
    cy.visit("/cif/projects");
    cy.findAllByRole("button", { name: /view/i }).first().click();
    cy.findByText(/Amendments & Other Revisions/i).click();

    // checking the view page for a draft revision
    cy.findAllByRole("button", { name: /^view \/ edit/i })
      .first()
      .click();
    cy.url().should("include", "/view");
    cy.findByText(/forms updated/i).should("be.visible");
    cy.happoAndAxe("Project Revision View", "Forms Updated", "main", true);
    cy.get("input[aria-label='Project Overview']").should("be.checked");
    cy.get("#root_projectName-revisionDiffOld").should(
      "have.text",
      "Test Project 001"
    );
    cy.get("#root_projectName-revisionDiffNew").should("have.text", "Bar");
    cy.get("input[aria-label='Project Details']").should("be.checked");
    cy.findByText(/project managers/i);
    cy.get("#root_cifUserId-revisionDiffOld").should(
      "have.text",
      "cif_internal Testuser"
    );
    cy.findByText(/project contacts/i);
    cy.get("#root_contactId-revisionDiffOld").should(
      "have.text",
      "Bob001 Loblaw001"
    );
    cy.get("#root_contactId-revisionDiffNew").should(
      "have.text",
      "Bob003 Loblaw003"
    );
    // just checking one of other forms are not checked
    cy.get("input[aria-label='Budgets, Expenses & Payments']").should(
      "not.be.checked"
    );
  });
});
