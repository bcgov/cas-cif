describe("when creating a project, the project page", () => {
  beforeEach(() => {
    cy.useMockedTime(new Date("June 10, 2020 09:00:00"));
    cy.sqlFixture("e2e/dbReset");
    cy.sqlFixture("dev/001_cif_user");
    cy.sqlFixture("dev/002_cif_operator");
    cy.sqlFixture("dev/003_cif_contact");
    cy.clock(new Date(2020, 5, 10), ["Date"]); // months are zero-indexed
    cy.mockLogin("cif_admin");
    cy.visit("/cif/projects");
    cy.get("button").contains("Add a Project").click();
  });

  it("allows an admin user to create a project", () => {
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
      "Some comments",
      "78.456"
    );
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe("Project Overview Form", "filled", "main");
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
    cy.happoAndAxe("Project Contacts Form", "filled", "main");
    cy.findByRole("button", { name: /^submit/i }).click();

    // add budgets, expenses, and payments
    cy.url().should("include", "/form/3");
    cy.findByText(/Yes/i).click();
    // checking default values
    cy.get('[aria-label="Province\'s Share Percentage"]').should(
      "have.value",
      "50 %"
    );
    cy.get('[aria-label="Performance Milestone Holdback Percentage"]').should(
      "have.value",
      "10 %"
    );

    cy.fillFundingAgreementForm(
      222,
      60,
      20,
      333,
      800,
      "2020-01-01",
      "2020-02-02"
    );
    cy.findByRole("button", { name: /Add funding source/i }).click();
    cy.fillAdditionalFundingSourceForm("Test Source 1", 111, "Approved", 1);
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe("Project budgets Form", "filled", "main");
    cy.findByRole("button", { name: /^submit/i }).click();

    // add milestone reports
    cy.addMilestoneReport(
      1,
      "desc",
      "General",
      "2020-01-01",
      "1991-04-17",
      "Professional Engineer",
      true
    );
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
    cy.happoAndAxe("Project Quarterly Reports Form", "filled", "main");
    cy.contains("Changes saved").should("be.visible");
    cy.findByText(/^submit/i).click();

    // add teimp reports
    cy.url().should("include", "/form/6");
    cy.findByRole("button", {
      name: /Add Emissions Intensity Report/i,
    }).click();
    cy.findByLabelText(/^Functional Unit/i).should("have.value", "tCO2e");
    cy.findAllByText("tCO2e").should("have.length", 4);
    cy.addEmissionIntensityReport(
      "2022-01-01",
      "2022-02-02",
      "tCO",
      "1",
      "2",
      "3",
      "G"
    );
    cy.contains(/Duration: 1 month, 1 day/i).should("be.visible");
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe("Emission Intensity Form", "filled", "main");
    cy.findByText(/Submit Emissions Intensity Report/).click();

    //add quarterly reports
    cy.url().should("include", "/form/6");
    cy.addQuarterlyReport(1, "2020-01-01", "2020-02-02", "1st comment");
    cy.addQuarterlyReport(2, "2022-01-01", "2022-02-02", "2nd comment");
    cy.findAllByRole("status").first().should("have.text", "Complete");
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe("Project quarterly reports Form", "filled", "main");
    cy.contains("Changes saved").should("be.visible");
    cy.findByText(/^submit/i).click();

    // No annual reports
    cy.url().should("include", "/form/7");
    cy.findByText(/Submit Annual Reports/i).click();

    //review and submit
    cy.contains("Review and Submit Project");

    // project overview section
    cy.findByText(/RFP Year ID/i)
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

    // funding agreement section
    cy.checkFundingAgreementForm(
      "$222.00",
      "60 %",
      "20 %",
      "$333.00",
      "$800.00",
      /Jan(\.)? 1, 2020/,
      /Feb(\.)? 2, 2020/,
      "$1133.00",
      true
    );
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
    cy.findByText(/^TEIMP start date/i)
      .next()
      .contains(/Jan(\.)? 1, 2022/)
      .should("be.visible");
    cy.findByText(/TEIMP end date/i)
      .next()
      .next()
      .contains(/Duration: 1 month, 1 day/i);
    cy.findByText(/^Functional Unit/i)
      .next()
      .should("have.text", "tCO");
    cy.findByText(/^Production Functional Unit/i)
      .next()
      .should("have.text", "G");

    cy.happoAndAxe("Project summary Form", "filled", "main", true);
    cy.findByRole("button", { name: /^submit/i }).click();
    cy.url().should("include", "/cif/projects");
    cy.findByText("TEST-123-12345").should("be.visible");
    // this checks that the project view list shows the milestone report status vs. the other report statuses
    cy.findAllByRole("status").should("have.text", "Late");
  });

  it("creates new contact and redirects a user back to project contact form and populate project contact form with newly created contact", () => {
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

  it("generates quarterly and annual reports automatically", () => {
    // add budgets, expenses, and payments
    cy.findByRole("heading", {
      name: /3. Budgets, Expenses & Payments/i,
    }).click();
    cy.findByText(/Add budgets/i).click();
    cy.url().should("include", "/form/3");
    cy.findByText(/Yes/i).click();
    cy.setDateInPicker("Contract Start Date", "2020-01-01");
    cy.setDateInPicker("Project Assets Life End Date", "2024-02-02");
    cy.contains("Changes saved").should("be.visible");

    // add teimp reports
    cy.findByRole("heading", {
      name: /5. Emissions Intensity Report/i,
    }).click();
    cy.findByText(/Add emissions intensity report/i).click();
    cy.url().should("include", "/form/6");
    cy.findByRole("button", {
      name: /Add Emissions Intensity Report/i,
    }).click();
    cy.setDateInPicker("TEIMP End Date", "2022-01-01");
    cy.setDateInPicker("Report Due Date", "2020-01-01");
    cy.contains("Changes saved").should("be.visible");

    //generate quarterly reports
    cy.findByRole("heading", { name: /6. Quarterly Reports/i }).click();
    cy.findByText(/Add quarterly reports/i).click();
    cy.url().should("include", "/form/6");
    cy.findByRole("button", { name: /generate quarterly reports/i }).click();
    cy.get(".reportHeader").should("have.length", 9);
    cy.findAllByText(/^Report Due Date$/i)
      .first()
      .next()
      .contains(/Jan(\.)? 05, 2020/);
    cy.findAllByText(/^Report Due Date$/i)
      .last()
      .next()
      .contains(/Jan(\.)? 05, 2022/);
    cy.findByText(/contract start date/i)
      .next()
      .contains(/Jan(\.)? 1, 2020/);
    cy.findByText(/TEIMP End Date/i)
      .next()
      .contains(/Jan(\.)? 1, 2022/);
    cy.happoAndAxe("Auto-generate quarterly reports", "generated", "main");

    //generate annual reports
    cy.findByRole("heading", { name: /7. Annual reports/i }).click();
    cy.findByText(/Add annual reports/i).click();
    cy.url().should("include", "/form/7");
    cy.findByRole("button", { name: /generate annual reports/i }).click();
    cy.get(".reportHeader").should("have.length", 4);
    cy.findAllByText(/^Report Due Date$/i)
      .first()
      .next()
      .contains(/Jan(\.)? 30, 2022/);
    cy.findAllByText(/^Report Due Date$/i)
      .last()
      .next()
      .contains(/Jan(\.)? 30, 2025/);
    cy.findByText(/Emissions Intensity Report Due Date/i)
      .next()
      .contains(/Jan(\.)? 1, 2020/);
    cy.findByText(/Project Assets Life End Date/i)
      .next()
      .contains(/Feb(\.)? 2, 2024/);
    cy.happoAndAxe("Auto-generate annual reports", "generated", "main");
  });
});

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
});
