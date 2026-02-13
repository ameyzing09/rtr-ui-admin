/// <reference types="cypress" />

/**
 * Spec #1 — Pending → Evaluation flow
 *
 * Proves:
 * - /my-pending contract is correct
 * - evaluationInstanceId wiring works
 * - Navigation lands on evaluation page
 *
 * If zero CTAs exist the test fails — that means no test data exists.
 * Fix the data, not the test.
 */
describe('Interviewer pending → evaluation flow', () => {
  beforeEach(() => {
    cy.loginAs('INTERVIEWER');
    cy.visit('/dashboard/interviews/my-pending');
  });

  it('opens evaluation from pending interview', () => {
    cy.getBySel('complete-evaluation-cta').should('have.length.greaterThan', 0);

    cy.getBySel('complete-evaluation-cta')
      .first()
      .should('be.visible')
      .click();

    cy.url().should('match', /\/dashboard\/evaluations\/[a-f0-9-]{36}$/);
    cy.contains(/evaluation/i).should('exist');
  });
});
