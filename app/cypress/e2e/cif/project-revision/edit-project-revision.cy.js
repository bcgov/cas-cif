describe("when editing a project, the project page", () => {
  beforeEach(() => {
    cy.useMockedTime(new Date("June 10, 2020 09:00:00"));
    cy.sqlFixture("e2e/dbReset");
    cy.sqlFixture("dev/001_cif_user");
    cy.sqlFixture("dev/002_cif_operator");
    cy.sqlFixture("dev/003_cif_contact");
    cy.sqlFixture("dev/004_cif_project");
    cy.sqlFixture("dev/005_cif_reporting_requirement");
    cy.sqlFixture("dev/006_cif_funding_parameter");
    cy.sqlFixture("dev/007_commit_project_revision");
    cy.sqlFixture("dev/008_cif_additional_funding_source");
    cy.clock(new Date(2020, 5, 10), ["Date"]); // months are zero-indexed
  });

  it("allows multiple users to edit an existing project", () => {
    cy.mockLogin("cif_admin");
    cy.visit("/cif/projects");
    cy.get("button").contains("View").first().as("firstViewButton");
    cy.wait(2000);
    cy.get("@firstViewButton").click();
    cy.wait(2000);
    cy.findByRole("button", { name: /edit/i }).should("be.visible");
    cy.findByRole("button", { name: /edit/i }).click();

    // edit overview -- change project name

    cy.findByLabelText(/Project Name/i)
      .should("have.value", "Test EP Project 001")
      .clear()
      .type("Bar");

    cy.contains("Changes saved.").should("be.visible");
    cy.findByText("Edit Project Overview")
      .next()
      .should("have.text", "In Progress");
    cy.happoAndAxe("Project Overview Form", "editing", "main", true);
    cy.findByRole("button", { name: /^submit/i }).click();

    // edit managers -- delete a manager
    cy.contains("Review and Submit Project");
    cy.findByText(/Project Details/i).click();
    cy.findByText(/Edit project managers/i).click();
    cy.url().should("include", "/form/1");
    cy.findByText("Project Managers").should("be.visible");
    cy.happoAndAxe("Project manager Form", "editing", "main");

    cy.findByLabelText(/tech team primary/i).should(
      "have.value",
      "cif_internal Testuser"
    );
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
    cy.findByText(/Project Details/i).click();
    cy.findByText(/Edit project contacts/i).click();
    cy.url().should("include", "/form/2");

    cy.findByLabelText(/Primary contact/i).click();
    cy.contains("Loblaw003").click();

    cy.contains("Changes saved.").should("be.visible");
    cy.findByLabelText(/Primary contact/i).should(
      "have.value",
      "Bob003 Loblaw003"
    );
    cy.happoAndAxe("Project Contacts Form", "editing", "main");
    cy.contains("Changes saved.").should("be.visible");
    cy.findByRole("button", { name: /^submit/i }).click();

    cy.contains("Review and Submit Project").should("be.visible");

    // edit budgets, expenses, and payments -- change funding agreement
    cy.contains(/Budgets, Expenses & Payments/i).click();
    cy.findByText(/Edit budgets/i).click();
    cy.url().should("include", "/form/3");
    cy.findByRole("button", { name: /submit/i }).should("not.exist");
    cy.fillFundingAgreementForm(
      333,
      70,
      444,
      900,
      "2020-01-01",
      "2020-12-31",
      30
    );
    cy.contains("Changes saved.").should("be.visible");

    // edit additional funding source
    cy.fillAdditionalFundingSourceForm("Test Source", 1000, "Denied", 1);
    cy.contains("Changes saved.").should("be.visible");
    cy.happoAndAxe("Project budgets Form", "editing", "main");
    cy.findByRole("button", { name: /^submit/i }).click();

    // edit milestone reports -- change date
    cy.contains("Review and Submit Project");
    cy.useMockedTime(new Date("June 10, 2020 09:00:01"));
    cy.findByRole("button", { name: /Milestone reports/i }).click();
    cy.findByText(/Edit milestone 1/i).click();
    cy.get("h3")
      .contains(/milestone 1/i)
      .click();
    cy.setDateInPicker("Report Due Date", "1999-01-31");
    cy.contains("Changes saved").should("be.visible");
    cy.get('[aria-label*="Substantial Completion Date"').contains(
      /Jan(\.)? 01, 1999/
    );
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe("Project milestone reports Form", "editing", "main");
    cy.findByRole("button", { name: /^submit/i }).click();

    cy.contains("Changes saved.");
    cy.findByText(/Review and Submit information/i).click();

    // edit quarterly reports -- delete a report
    cy.contains("Review and Submit Project");
    cy.findByRole("button", { name: /Quarterly reports/i }).click();
    cy.findByText(/Edit quarterly reports/i).click();
    cy.findByText(/Quarterly Report 1/i).click();
    cy.findAllByText(/Remove/i)
      .first()
      .click();
    cy.contains("Changes saved.");
    cy.findByText(/Quarterly Report 1/i).should("not.exist");
    cy.findByText(/No reports due/).should("be.visible");
    cy.contains("Changes saved.");

    // two below assertions are not necessary, but it's needed to slow down the test and run the accessibility checks correctly
    cy.findByText(/Complete/i).should("be.visible");
    cy.url().should("include", "/form/6");

    cy.happoAndAxe("Project Quarterly Reports Form", "editing", "main");
    cy.findByRole("button", { name: /^submit/i }).click();

    cy.contains("Changes saved.");
    cy.findByText(/Review and Submit information/i).click();

    // edit teimp
    cy.contains("Review and Submit Project");
    cy.findByRole("button", { name: /Emissions Intensity Report/i }).click();
    cy.findByText(/Edit emissions intensity report/i).click();
    cy.findByRole("button", {
      name: /Add Emissions Intensity Report/i,
    }).click();
    cy.addEmissionIntensityReport(
      "2022-01-01",
      "2022-02-02",
      "tCO2",
      "1",
      "2",
      "3",
      "G"
    );
    cy.contains("Changes saved.");
    cy.happoAndAxe("Project teimp agreement form", "editing", "main");
    cy.findByText(/Submit Emissions Intensity Report/i).click();

    cy.contains("Changes saved.");
    cy.findByText(/Review and submit information/i).click();

    // edit annual reports -- change comments
    cy.contains("Review and Submit Project");
    cy.findByRole("heading", { name: /7. Annual reports/i }).click();
    cy.findByText(/Edit annual reports/i).click();
    cy.findByText("Annual Report 1").click();
    cy.get('[aria-label*="General Comments"]')
      .eq(0)
      .clear()
      .type("new comment");
    cy.contains("Changes saved.").should("be.visible");
    cy.findByText(/Edit annual reports/i)
      .next()
      .should("have.text", "In Progress");
    cy.happoAndAxe("Project Annual Reports Form", "editing", "main");
    cy.findByRole("button", { name: /^submit/i }).click();

    cy.contains("Changes saved.");
    cy.findByText(/Review and Submit information/i).click();

    // check diffs
    cy.contains("Review and Submit Project");

    cy.get("#root_projectName-diffReviewAndSubmitInformationOld").should(
      "have.text",
      "Test EP Project 001"
    );
    cy.get("#root_projectName-diffReviewAndSubmitInformationNew").should(
      "have.text",
      "Bar"
    );

    cy.get("#root_cifUserId-diffReviewAndSubmitInformationOld").should(
      "have.text",
      "cif_internal Testuser"
    );
    cy.get("#root_cifUserId-diffReviewAndSubmitInformationOld")
      .next()
      .next()
      .should("have.text", "REMOVED");

    cy.get("#root_contactId-diffReviewAndSubmitInformationNew").should(
      "have.text",
      "Bob003 Loblaw003"
    );

    cy.get(
      "#root_contractStartDate-diffReviewAndSubmitInformationNew"
    ).contains(/Jan(\.)? 1, 2020/);
    cy.get(
      "#root_projectAssetsLifeEndDate-diffReviewAndSubmitInformationNew"
    ).contains(/Dec(\.)? 31, 2020/);

    cy.findByText("Quarterly Report removed").should("be.visible");

    cy.get(
      "#root_teimpReporting_measurementPeriodStartDate-diffReviewAndSubmitInformationNew"
    )
      .next()
      .next()
      .should("have.text", "ADDED");

    cy.get("#root_comments-diffReviewAndSubmitInformationOld").should(
      "have.text",
      "annual report comments 1"
    );

    cy.get("#root_comments-diffReviewAndSubmitInformationNew").should(
      "have.text",
      "new comment"
    );

    cy.findByRole("button", { name: /^submit/i }).should("be.disabled");

    cy.happoAndAxe(
      "Project revision summary",
      "no_change_reason",
      "main",
      true
    );

    // Verify that the revision can be accessed by other users
    cy.mockLogin("cif_internal");
    cy.visit("/cif/projects");
    cy.wait(2000);
    cy.get("@firstViewButton").click();
    cy.wait(2000);
    cy.findByRole("button", { name: /edit/i }).should("be.visible");
    cy.findByRole("button", { name: /edit/i }).click();
    cy.findByLabelText("Project Name").eq(0).should("have.value", "Bar");
    cy.findByLabelText("Project Name").eq(0).clear().type("Baz");
    cy.findByRole("button", { name: /submit project overview/i }).click();
    cy.findByText(/review and submit project/i).should("exist");

    // Navigate back to the Review and Submit information page
    cy.mockLogin("cif_admin");
    cy.visit("/cif/projects");
    cy.wait(1000);
    cy.get("@firstViewButton").click();
    cy.wait(1000);
    cy.findByText(/resume edition/i).click();
    cy.findByText(/submit change/i).click();
    cy.findByText(/Review and Submit information/i).click();
    cy.findByText(/review and submit project/i).should("exist");
    cy.get("textarea").click().type("foo");

    // Allow the component to finish saving before taking screenshot
    cy.contains("Changes saved").should("be.visible");
    cy.happoAndAxe(
      "Project revision summary",
      "with_change_reason",
      "main",
      true
    );
    cy.findByRole("button", { name: /^submit/i }).click();
  });
});
