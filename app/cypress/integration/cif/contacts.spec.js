describe("The contacts page", () => {
  beforeEach(() => {
    cy.sqlFixture("e2e/dbReset");
    cy.sqlFixture("dev/001_cif_user");
    cy.mockLogin("cif_internal");
    cy.useMockedTime(new Date("June 10, 2020 09:00:00"));
  });

  it("Allows creating and editing a contact", () => {
    cy.visit("/cif/contacts");
    cy.get("h2").contains("Contacts");
    cy.get("button").contains("Add").click();
    cy.get("input[aria-label='Given Name']").should("be.visible").type("Bob");
    cy.get("input[aria-label='Family Name']").type("Loblaw");
    cy.get("input[aria-label=Email]").type("bob@loblaw.ca");
    cy.get("input[aria-label='Company Name']").type("ABC");

    cy.contains("Changes saved").should("be.visible");
    cy.get("input[aria-label=Phone]").type("1234567890");
    cy.contains("Changes saved").should("be.visible");
    cy.get("body").happoScreenshot({
      component: "Contact form",
    });
    cy.get("button").contains("Submit").click();
    cy.get("table").contains("Loblaw, Bob");
    cy.get("table").contains("View").click();
    cy.contains("Contact Information");
    cy.get("body").happoScreenshot({
      component: "View contact",
    });
    cy.get("button").contains("Edit").click();
    cy.get("input[aria-label='Given Name']")
      .should("be.visible")
      .clear()
      .type("Rob");
    cy.get("button").contains("Submit").click();
    cy.get("table").contains("Loblaw, Rob");
  });

  it("Shows correct validation errors", () => {
    cy.visit("/cif/contacts");
    cy.get("h2").contains("Contacts");
    cy.get("button").contains("Add").click();
    cy.get("input[aria-label='Given Name']").should("be.visible").type("A");
    cy.get("input[aria-label='Family Name']").type("B");
    cy.get("input[aria-label=Email]").type("foo@bar.ca");
    cy.get("input[aria-label=Phone]").type("1234567890");
    cy.contains("Changes saved").should("be.visible");
    cy.get("button").contains("Submit").click();
    cy.url().should("include", "/cif/contacts");
    cy.get("button").contains("Add").click();
    cy.get("input[aria-label=Email]").type("foo@bar.ca");
    cy.contains("Changes saved").should("be.visible");
    cy.get("button").contains("Submit").click();
    cy.contains("email already exists").should("be.visible");
    cy.contains(/please enter a value/i).should("be.visible");
  });
});
