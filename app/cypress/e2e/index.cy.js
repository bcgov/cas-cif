describe("The index page", () => {
  it("contains the login button ", () => {
    cy.visit("/");
    cy.contains("h1", "Welcome").should("be.visible");
    cy.contains("h3", "CleanBC Industry Fund").should("be.visible");
    cy.findByRole("button", { name: /Administrator Login/i }).should("exist");
    cy.findByRole("button", { name: /External User Login/i }).should("exist");
  });
});
