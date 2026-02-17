describe('Login Flow', () => {
  it('should load login page', () => {
    cy.visit('/login')
    cy.contains('Login').should('be.visible')
  })
})
