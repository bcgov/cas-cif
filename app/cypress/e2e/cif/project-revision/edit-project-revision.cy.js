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
    cy.sqlFixture("dev/009_cif_project_revision_logs");
    cy.clock(new Date(2020, 5, 10), ["Date"]); // months are zero-indexed
  });

  it("allows multiple users to edit an existing project", () => {
    cy.mockLogin("cif_admin");
    cy.navigateToFirstProjectEditRevisionPage();
    cy.findByRole("heading", { name: /Amendment 2/i }).should("be.visible");
    cy.findByText(/1. Project Overview/i).click();
    cy.findByText(/Edit Project Overview/i).click();
    cy.url().should("include", "/form/0");
    // edit overview -- change project name and score

    cy.findByLabelText(/Project Name/i)
      .should("have.value", "Test EP Project 001")
      .clear()
      .type("Bar");

    cy.findByLabelText(/Score/i).should("have.value", 1).clear().type(99);

    cy.contains("Changes saved.").should("be.visible");
    cy.findByText("Edit Project Overview")
      .next()
      .should("have.text", "In Progress");
    cy.happoAndAxe("Project Overview Form", "editing", "main", true);
    cy.findByRole("button", { name: /^submit/i }).click();

    cy.findByText("Amendment 2").should("be.visible"); // ensure the submit page has loaded

    // edit managers -- delete a manager
    cy.findByRole("button", { name: /^2. Project Details/i }).click();
    cy.findByText(/Edit project managers/i).click();
    cy.url().should("include", "/form/1");
    cy.findByText("Project Managers").should("be.visible");

    cy.findByLabelText(/tech team primary/i).should(
      "have.value",
      "cif_internal Testuser"
    );
    cy.happoAndAxe("Project manager Form", "editing", "main");
    cy.get("label")
      .contains(/tech team primary/i)
      .next()
      .find("button")
      .contains("Clear")
      .click();
    cy.findByLabelText(/tech team primary/i).should("be.empty");

    cy.contains("Changes saved.").should("be.visible");
    cy.findByRole("button", { name: /^submit/i }).click();

    cy.findByText("Amendment 2").should("be.visible"); // ensure the submit page has loaded

    // edit contacts -- add a secondary contact
    cy.findByRole("button", { name: /^2. Project Details/i }).click();
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

    cy.findByText("Amendment 2").should("be.visible"); // ensure the submit page has loaded

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

    cy.findByText("Amendment 2").should("be.visible"); // ensure the submit page has loaded

    // edit milestone reports -- change date
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

    cy.findByText("Amendment 2").should("be.visible"); // ensure the submit page has loaded

    // edit quarterly reports -- delete a report
    cy.findByRole("button", { name: /Quarterly reports/i }).click();
    cy.findByText(/Edit quarterly reports/i).click();
    cy.findByText(/Quarterly Report 1/i).click();
    cy.findAllByText(/Remove/i)
      .first()
      .click();
    cy.contains("Changes saved.");
    cy.findByText(/Quarterly Report 1/i).should("not.exist");
    cy.findByText(/No reports due/).should("be.visible");
    cy.findByRole("button", { name: /generate quarterly reports/i }).should(
      "not.be.disabled"
    );
    cy.contains("Changes saved.");

    // two below assertions are not necessary, but it's needed to slow down the test and run the accessibility checks correctly
    cy.findByText(/Complete/i).should("be.visible");
    cy.url().should("include", "/form/6");

    cy.happoAndAxe("Project Quarterly Reports Form", "editing", "main");
    cy.findByRole("button", { name: /^submit/i }).click();

    cy.contains("Changes saved.");
    cy.findByText("Amendment 2").should("be.visible"); // ensure the submit page has loaded

    // edit teimp
    cy.findByRole("button", { name: /Emissions Intensity Report/i }).click();
    cy.findByText(/Edit emissions intensity report/i).click();
    cy.addOrEditEmissionIntensityReport(
      "2022-01-01",
      "2022-10-31",
      "tCO",
      "1.23",
      "2.34",
      "3.45",
      "G",
      100
    );

    cy.contains("Changes saved.");
    cy.happoAndAxe("Project teimp agreement form", "editing", "main");
    cy.findByText(/Submit Emissions Intensity Report/i).click();

    cy.contains("Changes saved.");

    cy.findByText("Amendment 2").should("be.visible"); // ensure the submit page has loaded

    // edit annual reports -- change comments
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

    // check diffs
    cy.findByText("Amendment 2").should("be.visible"); // ensure the submit page has loaded

    cy.get("#root_projectName-diffOld").should(
      "have.text",
      "Test EP Project 001"
    );
    cy.get("#root_projectName-diffNew").should("have.text", "Bar");

    cy.get("#root_score-diffOld").should("have.text", "1.000");
    cy.get("#root_score-diffNew").should("have.text", "99.000");

    cy.get("#root_rank-diffOld").should("have.text", 50);
    cy.get("#root_rank-diffNew").should("have.text", 1);

    cy.get("#root_cifUserId-diffOld").should(
      "have.text",
      "cif_internal Testuser"
    );
    cy.get("#root_contactId-diffNew").should("have.text", "Bob003 Loblaw003");

    cy.get("#root_contractStartDate-diffNew").contains(/Jan(\.)? 1, 2020/);
    cy.get("#root_projectAssetsLifeEndDate-diffNew").contains(
      /Dec(\.)? 31, 2020/
    );

    cy.findByText("Quarterly Report").should("be.visible");
    cy.get(".diffOld").contains("Quarterly Report").should("be.visible");

    // TEIMP diffs
    cy.get("#root_measurementPeriodStartDate-diffOld").should(
      "have.text",
      "Jun 1, 2023"
    );
    cy.get("#root_measurementPeriodStartDate-diffNew").should(
      "have.text",
      "Jan 1, 2022"
    );
    cy.get("#root_measurementPeriodEndDate-diffOld").should(
      "have.text",
      "Jul 1, 2023"
    );
    cy.get("#root_measurementPeriodEndDate-diffNew").should(
      "have.text",
      "Oct 31, 2022"
    );
    cy.get("#root_emissionFunctionalUnit-diffOld").should("have.text", "tCO2e");
    cy.get("#root_emissionFunctionalUnit-diffNew").should("have.text", "tCO");
    cy.get("#root_productionFunctionalUnit-diffOld").should("have.text", "Gj");
    cy.get("#root_productionFunctionalUnit-diffNew").should("have.text", "G");
    cy.get("#root_baselineEmissionIntensity-diffOld").should(
      "have.text",
      "324.25364000"
    );
    cy.get("#root_baselineEmissionIntensity-diffNew").should(
      "have.text",
      "1.23000000"
    );
    cy.get("#root_targetEmissionIntensity-diffOld").should(
      "have.text",
      "23.23570000"
    );
    cy.get("#root_targetEmissionIntensity-diffNew").should(
      "have.text",
      "2.34000000"
    );
    cy.get("#root_postProjectEmissionIntensity-diffOld").should(
      "have.text",
      "124.35000000"
    );
    cy.get("#root_postProjectEmissionIntensity-diffNew").should(
      "have.text",
      "3.45000000"
    );
    cy.get("#root_calculatedEiPerformance-diffOld").should(
      "have.text",
      "66.41 %"
    );
    cy.get("#root_calculatedEiPerformance-diffNew").should(
      "have.text",
      "200.00 %"
    );
    cy.get("#root_adjustedEmissionsIntensityPerformance-diffOld").should(
      "have.text",
      "98.00 %"
    );
    cy.get("#root_adjustedEmissionsIntensityPerformance-diffNew").should(
      "have.text",
      "100.00 %"
    );
    cy.get("#root_actualPerformanceMilestoneAmount-diffOld").should(
      "have.text",
      "$0.10"
    );
    cy.get("#root_actualPerformanceMilestoneAmount-diffNew").should(
      "have.text",
      "$0.30"
    );
    cy.get("#root_maximumPerformanceMilestoneAmount-diffOld").should(
      "have.text",
      "$0.10"
    );
    cy.get("#root_maximumPerformanceMilestoneAmount-diffNew").should(
      "have.text",
      "$0.30"
    );

    cy.get("#root_comments-diffOld").should(
      "have.text",
      "annual report comments 1"
    );

    cy.get("#root_comments-diffNew").should("have.text", "new comment");

    cy.get("#root_revisionStatus").contains(/In Discussion/i);

    cy.get('svg[data-icon="caret-down"]')
      .should("have.length", 8)
      .and("be.visible"); // to fix happo diffs

    cy.happoAndAxe(
      "Project revision summary",
      "no_change_reason",
      "main",
      true
    );

    // Verify that the revision can be accessed by other users
    cy.mockLogin("cif_internal");
    cy.navigateToFirstProjectEditRevisionPage();
    cy.findByText("Amendment 2").should("be.visible"); // ensure the submit page has loaded
    cy.findByText(/1. Project Overview/i).click();
    cy.findByText(/Edit Project Overview/i).click();
    cy.url().should("include", "/form/0");
    cy.findByLabelText("Project Name").eq(0).should("have.value", "Bar");
    cy.findByLabelText("Project Name").eq(0).clear().type("Baz");
    cy.findByRole("button", { name: /submit project overview/i }).click();

    cy.findByText("Amendment 2").should("be.visible"); // ensure the submit page has loaded

    // Navigate back to the Review and Submit information page
    cy.mockLogin("cif_admin");
    cy.navigateToFirstProjectEditRevisionPage();
    cy.findByText("Amendment 2").should("be.visible"); // ensure the submit page has loaded
    cy.get("textarea").click().type("foo");

    // Allow the component to finish saving before taking screenshot
    cy.contains(
      /To confirm your change, please click the \"Update\" button./i
    ).should("be.visible");

    cy.get('svg[data-icon="caret-down"]')
      .should("have.length", 8)
      .and("be.visible"); // to fix happo diffs
    cy.happoAndAxe(
      "Project revision summary",
      "with_change_reason",
      "main",
      true
    );
    cy.findAllByRole("button", { name: /^update/i })
      .eq(2)
      .click();
  });
});
