describe("when creating a project, the project page", () => {
  beforeEach(() => {
    cy.sqlFixture("e2e/dbReset");
    cy.sqlFixture("dev/001_cif_user");
    cy.sqlFixture("dev/002_cif_operator");
    cy.sqlFixture("dev/003_cif_contact");
    cy.useMockedTime(new Date("June 10, 2020 09:00:00"));
    cy.clock(new Date(2020, 5, 10), ["Date"]); // months are zero-indexed
  });

  it("allows an admin user to create a project", () => {
    cy.mockLogin("cif_admin");
    cy.visit("/cif/projects");
    cy.get("button").contains("Add a Project").click();

    // add overview
    cy.fillOverviewForm(
      "Emissions Performance",
      "2020",
      "first operator legal name (AB1234567)",
      "Cement",
      "TEST-123-12345",
      "Foo",
      "Bar",
      "100",
      "Project Underway",
      "Some comments"
    );
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe("Project overview Form", "filled", "main");
    cy.findByRole("button", { name: /^submit/i }).click();

    // add managers
    cy.findByText(/Add project managers/i).click();
    cy.fillManagersForm("Swanson", "Ludgate", "Knope");
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe("Project manager Form", "filled", "main");
    cy.findByRole("button", { name: /^submit/i }).click();

    // add contacts
    cy.findByText(/Add project contacts/i).click();
    cy.fillContactsForm("Loblaw003", "Loblaw004");
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe("Project contacts Form", "filled", "main");
    cy.findByRole("button", { name: /^submit/i }).click();

    // add budgets, expenses, and payments
    cy.findByText(/Budgets, Expenses & Payments/i).click();
    cy.findByRole("link", { name: /add funding agreement/i }).click();
    cy.url().should("include", "/form/3");
    cy.findByRole("button", { name: /add funding agreement/i }).click();
    // checking default values
    cy.get('[aria-label="Province Share Percentage"]').should("have.value", 50);
    cy.get('[aria-label="Holdback Percentage"]').should("have.value", 10);

    cy.fillFundingAgreementForm(111, 222, 60, 20, 333);
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe("Project budgets Form", "filled", "main");
    cy.findByRole("button", { name: /^submit/i }).click();

    // add milestone reports

    cy.findByRole("link", { name: /Milestone reports/i }).click();
    cy.findByText(/Add another milestone report/i).click();

    cy.url().should("include", "/form/4");
    cy.get('[aria-label="Milestone Description"]').clear().type("desc");
    cy.addDueDate(0, "2020-01-01");
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe("Project milestone reports Form", "filled", "main");
    cy.findByRole("button", { name: /^submit/i }).click();
    cy.findAllByRole("status").first().should("have.text", "Late");

    //add quarterly reports
    cy.addQuarterlyReport(
      1,
      "2020-01-01",
      "2020-02-02",
      "I am the first general comment"
    );
    cy.addQuarterlyReport(
      2,
      "2022-01-01",
      "2022-02-02",
      "I am the second general comment"
    );
    cy.findAllByRole("status").first().should("have.text", "Complete");
    cy.contains("Changes saved").should("be.visible");
    cy.get('[aria-label="General Comments"]')
      .eq(0)
      .should("have.value", "I am the first general comment");
    cy.happoAndAxe("Project quarterly reports Form", "filled", "main");
    cy.contains("Changes saved").should("be.visible");
    cy.findByText(/^submit/i).click();

    //add annual reports
    cy.addAnnualReport(
      1,
      "2022-01-01",
      "2022-02-02",
      "Annual report description n stuff"
    );
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe("Project annual reports Form", "filled", "main");
    cy.findByRole("button", { name: /^submit/i }).click();
    cy.findAllByRole("status").first().should("have.text", "Complete");

    //review and submit
    cy.contains("Review and Submit Project");
    cy.findByText(/Funding Stream RFP ID/i)
      .next()
      .should("have.text", "Emissions Performance - 2020");
    cy.findByText(/Operator Name/i)
      .next()
      .should("have.text", "first operator legal name (AB1234567)");
    cy.findByText(/Proposal Reference/i)
      .next()
      .should("have.text", "TEST-123-12345");
    cy.findByText(/Project Name/i)
      .next()
      .should("have.text", "Foo");
    cy.findByText(/Summary/i)
      .next()
      .should("have.text", "Bar");
    cy.findByText(/Total Funding Request/i)
      .next()
      .should("have.text", "$100.00");
    cy.findByText(/Project Status/i)
      .next()
      .should("have.text", "Project Underway");
    cy.findAllByText(/General Comments/i)
      .eq(0)
      .next()
      .should("have.text", "Some comments");
    cy.findByText(/tech team primary/i)
      .next()
      .should("have.text", "Swanson, Ron");
    cy.findByText(/tech team secondary/i)
      .next()
      .should("have.text", "Ludgate, April");
    cy.findByText(/ops team primary/i)
      .next()
      .should("have.text", "Knope, Leslie");
    cy.contains(/Primary contact/i)
      .next()
      .should("have.text", "Loblaw003, Bob003");
    cy.findByText(/^Secondary contacts/i)
      .next()
      .should("have.text", "Loblaw004, Bob004");
    cy.happoAndAxe("Project summary Form", "filled", "main", true);
    cy.findByRole("button", { name: /^submit/i }).click();
    cy.url().should("include", "/cif/projects");
    cy.findByText("TEST-123-12345").should("be.visible");
    // this checks that the project view list shows the milestone report status vs. the other report statuses
    cy.findAllByRole("status").should("have.text", "Late");
  });

  it("creates new contact and redirects a user back to project contact form and populate project contact form with newly created contact", () => {
    cy.mockLogin("cif_admin");

    cy.visit("/cif/projects");
    cy.get("button").contains("Add a Project").click();
    cy.findByText(/Project Details/i).click();
    cy.findByText(/Add project contacts/i).click();

    cy.url().should("include", "/form/2");

    cy.findAllByRole("button", { name: /Create new contact/i }).click();

    // Checking multiple query parameters in the url
    cy.url()
      .should("include", "/cif/contact/form")
      .should("include", "projectContactFormId")
      .should("include", "projectId")
      .should("include", "contactIndex")
      .should("include", "projectRevisionRowId")
      .should("include", "connectionString");

    //Add new contact
    cy.get("input[aria-label='Given Name']").should("be.visible").type("Bob");
    cy.get("input[aria-label='Family Name']").type("Loblaw");
    cy.get("input[aria-label=Email]").type("bob@loblaw.ca");
    cy.get("input[aria-label=Phone]").type("1234567890");
    cy.get("input[aria-label='Company Name']").type("ABC");
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe("Contacts Form", "filled", "main");
    cy.get("button").contains("Submit").click();
    //Back to project contact form
    cy.url().should("include", "/form/2");
    cy.findByLabelText(/primary contact/i).should("have.value", "Loblaw, Bob");

    cy.findAllByRole("button", { name: /Create new contact/i }).should(
      "not.exist"
    );
  });
});
