import { aliasOperation } from "../../../utils/graphql-test-utils";

describe("the project amendment and revisions page", () => {
  beforeEach(() => {
    cy.intercept("POST", "http://localhost:3004/graphql", (req) => {
      aliasOperation(req, "createProjectRevisionMutation");
    });
    cy.useMockedTime(new Date("June 10, 2020 09:00:00"));
    cy.sqlFixture("e2e/dbReset");
    cy.sqlFixture("dev/001_cif_user");
    cy.sqlFixture("dev/002_cif_operator");
    cy.sqlFixture("dev/003_cif_contact");
    cy.sqlFixture("dev/004_cif_project");
    cy.sqlFixture("dev/007_commit_project_revision");
    cy.mockLogin("cif_admin");
  });

  it.only("creates new revision/amendment", () => {
    cy.visit("/cif/projects");
    cy.get("button").contains("View").first().as("firstViewButton");
    cy.get("@firstViewButton").click();
    cy.findByText(/Amendments & Other Revisions/i).click();
    cy.findByText(/New Revision/i).click();
    cy.url().should("include", "/create");
    cy.get("form").contains("Amendment", { matchCase: false });
    cy.get("form").contains("General Revision", { matchCase: false });
    cy.happoAndAxe("Project Revision Create", "view", "main");
    cy.get('[type="radio"]').check("Amendment");
    cy.get(".checkbox").contains("Scope").click();
    cy.wait(10000);
    cy.get("button").contains("New Revision").trigger("click");
    cy.wait(10000);
    // cy.wait("@gqlcreateProjectRevisionMutation")
    //   .its("response")
    //   .should("have.property", "body");
    cy.url().should("include", "/form/0");
  });
  it.only("displays updated forms in a project revision/amendment", () => {
    cy.visit("/cif/projects");
    cy.get("button").contains("View").first().as("firstViewButton");
    cy.get("@firstViewButton").click();
    cy.findByText(/Amendments & Other Revisions/i).click();
    cy.findByText(/New Revision/i).click();
    cy.url().should("include", "/create");
    cy.get('[type="radio"]').check("General Revision");
    cy.wait(10000);
    cy.get("button").contains("New Revision").click();
    // cy.findByText(/An error occurred/i).should("be.visible");
    cy.url().should("include", "/form/0");

    // edit overview -- change project name
    cy.findByLabelText(/project name/i)
      .should("have.value", "Test EP Project 001")
      .clear()
      .type("Bar");
    cy.contains("Changes saved.");
    cy.findByRole("button", { name: /^submit/i }).click();

    // edit managers -- delete a manager
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
    cy.findByText("General Revision 2").should("be.visible"); // ensure the submit page has loaded

    // edit contacts -- add a secondary contact
    cy.findByRole("button", { name: /^2. Project Details/i }).click();
    cy.findByText(/edit project contacts/i).click();
    cy.url().should("include", "/form/2");

    cy.findByText(/project details/i).click();
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
    cy.navigateToFirstProjectEditRevisionPage();
    cy.findByText(/forms updated/i).should("be.visible");
    // Screenshot below is commented out because of flakiness. Documented in ticket #1194.
    // cy.happoAndAxe("Project Revision Edit", "Forms Updated", "main", true);
    cy.get("input[aria-label='Project Overview']").should("be.checked");
    cy.get("#root_projectName-diffOld").should(
      "have.text",
      "Test EP Project 001"
    );
    cy.get("#root_projectName-diffNew").should("have.text", "Bar");
    cy.get("input[aria-label='Project Details']").should("be.checked");
    cy.findByText(/project managers/i);
    cy.get("#root_cifUserId-diffOld").should(
      "have.text",
      "cif_internal Testuser"
    );
    cy.findByText(/project contacts/i);
    cy.get("#root_contactId-diffOld").should("have.text", "Bob001 Loblaw001");
    cy.get("#root_contactId-diffNew").should("have.text", "Bob003 Loblaw003");
    // just checking one of other forms are not checked
    cy.get("input[aria-label='Budgets, Expenses & Payments']").should(
      "not.be.checked"
    );
  });
  it("changes the status, pending actions from and change reason for a revision/amendment", () => {
    cy.sqlFixture("dev/009_cif_project_revision_logs");
    cy.navigateToFirstProjectEditRevisionPage();
    cy.get("h2").contains(/amendment 2/i);
    cy.findByText(/status/i)
      .next()
      .contains("In Discussion");
    cy.findByText("General Comments (optional)").should("be.visible");

    // changing the status to non-applied
    cy.findAllByRole("button", { name: /update/i })
      .first()
      .as("revisionStatusUpdateButton");
    cy.get("@revisionStatusUpdateButton").should("be.disabled");
    cy.get('[aria-label="Status"]').select("Pending Province Approval");
    cy.get("@revisionStatusUpdateButton").should("not.be.disabled");
    cy.contains(
      'To confirm your change, please click the "Update" button.'
    ).should("be.visible");
    cy.get("@revisionStatusUpdateButton").click();
    cy.findAllByText("Updated").should("have.length", 1);
    cy.get("@revisionStatusUpdateButton").should("be.disabled");

    // changing the pending actions from
    cy.findAllByRole("button", { name: /update/i })
      .eq(1)
      .as("pendingActionsFromUpdateButton");
    cy.get("@pendingActionsFromUpdateButton").should("be.disabled");
    cy.get('[aria-label="Pending actions from"]').select("Tech Team");
    cy.get("@pendingActionsFromUpdateButton").should("not.be.disabled");
    cy.contains(
      'To confirm your change, please click the "Update" button.'
    ).should("be.visible");
    cy.get("@pendingActionsFromUpdateButton").click();
    cy.findAllByText("Updated").should("have.length", 2);
    cy.get("@pendingActionsFromUpdateButton").should("be.disabled");

    // changing the general comments(change reason)
    cy.findAllByRole("button", { name: /update/i })
      .last()
      .as("changeReasonUpdateButton");
    cy.get("@changeReasonUpdateButton").should("be.disabled");
    cy.get("textarea").type("test change reason");
    cy.get("@changeReasonUpdateButton").should("not.be.disabled");
    cy.contains(
      'To confirm your change, please click the "Update" button.'
    ).should("be.visible");
    cy.get("@changeReasonUpdateButton").click();
    cy.findAllByText("Updated").should("have.length", 3);

    // change the status to applied and make the page read only
    cy.get("@revisionStatusUpdateButton").should("be.disabled");
    cy.get('[aria-label="Status"]').select("Applied");
    cy.contains(
      'Once approved, this revision will be immutable. Click the "Update" button to confirm.'
    ).should("be.visible");
    cy.get("@revisionStatusUpdateButton").click();
    cy.findAllByRole("button", { name: /update/i }).should("have.length", 0);
    cy.findByText(/status/i)
      .next()
      .contains("Applied");
    cy.findByText("Pending actions from (optional)")
      .next()
      .contains("Tech Team");
    cy.findByText("General Comments (optional)")
      .next()
      .contains("test change reason");
    // Screenshot below is commented out because of flakiness. Documented in ticket #1194.
    // cy.happoAndAxe("Project Revision View", "view", "main");
  });
});
