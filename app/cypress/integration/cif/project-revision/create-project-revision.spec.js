describe("when creating a project, the project page", () => {
  beforeEach(() => {
    cy.useMockedTime(new Date("June 10, 2020 09:00:00"));
    cy.sqlFixture("e2e/dbReset");
    cy.sqlFixture("dev/001_cif_user");
    cy.sqlFixture("dev/002_cif_operator");
    cy.sqlFixture("dev/003_cif_contact");
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
    cy.url().should("include", "/form/1");
    cy.fillManagersForm("Swanson", "Ludgate", "Knope");
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe("Project manager Form", "filled", "main");
    cy.findByRole("button", { name: /^submit/i }).click();

    // add contacts
    cy.url().should("include", "/form/2");
    cy.fillContactsForm(
      "Loblaw003",
      "bob.l003@example.com",
      "Loblaw004",
      "bob.l004@example.com"
    );
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe("Project contacts Form", "filled", "main");
    cy.findByRole("button", { name: /^submit/i }).click();

    // add budgets, expenses, and payments
    cy.url().should("include", "/form/3");
    cy.findByText(/Yes/i).click();
    // checking default values
    cy.get('[aria-label="Province Share Percentage"]').should(
      "have.value",
      "50 %"
    );
    cy.get('[aria-label="Holdback Percentage"]').should("have.value", "10 %");

    cy.fillFundingAgreementForm(111, 222, 60, 20, 333, 800);
    cy.contains("Changes saved").should("be.visible");
    cy.findByRole("button", { name: /Add funding source/i }).click();
    cy.fillAdditionalFundingSourceForm("Test Source 1", 111, "Approved", 1);
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe("Project budgets Form", "filled", "main");
    cy.findByRole("button", { name: /^submit/i }).click();

    // add milestone reports

    cy.url().should("include", "/form/4");
    cy.findByText(/Add another milestone report/i).click();
    cy.get('[aria-label="Milestone Description"]').clear().type("desc");
    cy.get('[aria-label="Maximum Amount"]').clear().type(100);
    cy.get('[aria-label="Total Eligible Expenses"]').clear().type(100);
    cy.addDueDate(0, "2020-01-01");
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe("Project milestone reports Form", "filled", "main");
    cy.findAllByRole("status").first().should("have.text", "Late");
    cy.findByRole("button", { name: /^submit/i }).click();

    cy.url().should("include", "/form/5");
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
    cy.happoAndAxe("Project quarterly reports Form", "filled", "main");
    cy.contains("Changes saved").should("be.visible");
    cy.findByText(/^submit/i).click();

    // add teimp reports
    cy.url().should("include", "/form/6");
    cy.findByRole("button", { name: /Add TEIMP Agreement/i }).click();
    cy.findByLabelText(/^Functional Unit/i).should("have.value", "tCO2e");
    cy.findAllByText("tCO2e").should("have.length", 4);
    cy.addEmissionIntensityReport(
      "2022-01-01",
      "2022-02-02",
      "tCO",
      "G",
      "1",
      "2",
      "3"
    );
    cy.contains(/Duration: 1 month, 1 day/i).should("be.visible");
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe("Emission Intensity Form", "filled", "main");
    cy.findByText(/Submit TEIMP Report/).click();

    // No annual reports
    cy.url().should("include", "/form/7");
    cy.findByText(/Submit Annual Reports/i).click();

    //review and submit
    cy.contains("Review and Submit Project");

    //brianna
    cy.wait(2000);
    cy.checkA11y();

    // project overview section
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
    cy.findByText(/Project Description/i)
      .next()
      .should("have.text", "Bar");

    // funding agreement section
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

    // additional funding sources section
    cy.findByText(/Additional Funding Source 1/i)
      .next()
      .should("have.text", "Test Source 1");
    cy.findByText(/Additional Funding Amount \(Source 1\)/i)
      .next()
      .should("have.text", "$111.00");
    cy.findByText(/Additional Funding Status \(Source 1\)/i)
      .next()
      .should("have.text", "Approved");

    // project managers section
    cy.findByText(/tech team primary/i)
      .next()
      .should("have.text", "Ron Swanson");
    cy.findByText(/tech team secondary/i)
      .next()
      .should("have.text", "April Ludgate");
    cy.findByText(/ops team primary/i)
      .next()
      .should("have.text", "Leslie Knope");

    // project contacts section
    cy.contains(/Primary contact/i)
      .next()
      .should("have.text", "Bob003 Loblaw003");
    cy.findByText(/^Secondary contacts/i)
      .next()
      .should("have.text", "Bob004 Loblaw004");

    // TEIMP section
    cy.findByText(/^Measurement period start date/i)
      .next()
      .contains(/Jan(\.)? 1, 2022/)
      .should("be.visible");
    cy.findByText(/Measurement period end date/i)
      .next()
      .next()
      .contains(/Duration: 1 month, 1 day/i);
    cy.findByText(/^Functional Unit/i)
      .next()
      .should("have.text", "tCO");
    cy.findByText(/^Production Functional Unit/i)
      .next()
      .should("have.text", "G");

    cy.happoAndAxe("Project summary Form", "filled", "main");
    cy.findByRole("button", { name: /^submit/i }).click();
    cy.url().should("include", "/cif/projects");
    cy.findByText("TEST-123-12345").should("be.visible");
    // this checks that the project view list shows the milestone report status vs. the other report statuses
    cy.findAllByRole("status").should("have.text", "Late");
  });

  xit("creates new contact and redirects a user back to project contact form and populate project contact form with newly created contact", () => {
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
    cy.findByLabelText(/primary contact/i).should("have.value", "Bob Loblaw");

    cy.findAllByRole("button", { name: /Create new contact/i }).should(
      "not.exist"
    );
  });
});
