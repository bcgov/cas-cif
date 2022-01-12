describe("The index page", () => {
  it("contains the login button ", () => {
    cy.visit("/");
    cy.get("header").contains("Log in");
  });
});
