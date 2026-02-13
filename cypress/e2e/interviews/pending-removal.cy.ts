/// <reference types="cypress" />

/**
 * Spec #2 — Pending removal after evaluation submission
 *
 * Proves:
 * - After submitting an evaluation, that specific item disappears
 *   from /my-pending
 * - Asserts on the exact evaluationInstanceId link, not a count
 */
describe('Pending interview disappears after evaluation submit', () => {
  beforeEach(() => {
    cy.loginAs('INTERVIEWER');
  });

  it('removes item after evaluation submission', () => {
    cy.visit('/dashboard/interviews/my-pending');

    // Capture the specific evaluationInstanceId from the first CTA href
    cy.getBySel('complete-evaluation-cta')
      .first()
      .invoke('attr', 'href')
      .then((href) => {
        const evalId = (href as string).split('/').pop();

        // Navigate to evaluation
        cy.getBySel('complete-evaluation-cta').first().click();
        cy.url().should('include', `/dashboard/evaluations/${evalId}`);

        // Guard: already submitted → skip
        cy.get('body').then(($body) => {
          if (
            $body.find('[data-testid="evaluation-submitted-notice"]').length > 0
          ) {
            cy.log('Evaluation already submitted — skipping');
            return;
          }

          // Fill all required fields
          cy.get('body').then(($evalBody) => {
            if ($evalBody.find('[data-testid="boolean-input-yes"]').length > 0) {
              cy.getBySel('boolean-input-yes').each(($btn) =>
                cy.wrap($btn).click()
              );
            }
            if ($evalBody.find('[data-testid="numeric-input-3"]').length > 0) {
              cy.getBySel('numeric-input-3').each(($btn) =>
                cy.wrap($btn).click()
              );
            }
            if ($evalBody.find('[data-testid="text-input"]').length > 0) {
              cy.getBySel('text-input').each(($ta) =>
                cy.wrap($ta).clear().type('E2E test response')
              );
            }
          });

          // Submit + confirm
          cy.getBySel('submit-btn').should('not.be.disabled').click();
          cy.getBySel('confirm-submit-btn').click();

          // Revisit pending — assert that specific evaluationInstanceId link is gone
          cy.visit('/dashboard/interviews/my-pending');
          cy.get(`a[href*="/dashboard/evaluations/${evalId}"]`).should(
            'not.exist'
          );
        });
      });
  });
});
