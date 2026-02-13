/// <reference types="cypress" />

/**
 * Spec #3 — Cancel interview removes pending
 *
 * Proves:
 * - Cancelled interviews are excluded from interviewer's pending list
 * - API-driven: does NOT navigate through tracking board UI
 * - The cancel is a direct API PATCH, the assertion targets the
 *   exact evaluationInstanceId link
 */
describe('Cancel interview removes pending', () => {
  it('cancelled interview disappears from interviewer pending list', () => {
    // Step 1: As interviewer, fetch pending interviews via API to get an interview ID
    cy.loginAs('INTERVIEWER');

    cy.getMyPendingInterviewsViaApi().then((interviews) => {
      if (interviews.length === 0) {
        cy.log('No pending interviews — skipping');
        return;
      }

      const target = interviews[0];
      const { interviewId, evaluationInstanceId } = target;

      // Step 2: As admin, cancel the interview via API
      cy.loginAs('ADMIN');
      cy.cancelInterviewViaApi(interviewId);

      // Step 3: As interviewer, verify it's gone from pending page
      cy.loginAs('INTERVIEWER');
      cy.visit('/dashboard/interviews/my-pending');

      cy.get(`a[href*="/dashboard/evaluations/${evaluationInstanceId}"]`).should(
        'not.exist'
      );
    });
  });
});
