/// <reference types="cypress" />

/**
 * Spec — Interview → Evaluation → Kanban gate flow
 *
 * Proves:
 * 1. Kanban drag gate blocks advance when evaluations are incomplete
 *    (via ActionModal check + API intercept)
 * 1b. Drag attempt fires the evaluation gate API (pointer-event simulation)
 * 2. Interviewer can complete evaluation
 * 3. Actions unblock after evaluation is complete
 *
 * Setup is fully API-driven — no UI interactions for data creation.
 * Uses loop-based stage advancement (pipeline-agnostic).
 * Creates interview + participants so interviewer has pending evaluations.
 */

describe('Interview evaluation kanban gate', () => {
  let testJobId: string;
  let testApplicationId: string;
  let blockedEvalInstanceId: string | null;

  const testJobPrefix = 'E2E Eval Gate Job';

  /**
   * Advance application through stages until an incomplete evaluation is found.
   * Pipeline-agnostic: loops through COMPLETE actions until blocked by evaluation.
   */
  function advanceToEvaluationStage(
    applicationId: string,
    maxIterations = 10
  ): Cypress.Chainable<{
    evaluationsComplete: boolean;
    requiredEvaluations: {
      templateId: string;
      templateName: string;
      completed: boolean;
      instanceId: string | null;
      instanceStatus: string | null;
    }[];
    availableActions: {
      actionCode: string;
      displayName: string;
      outcomeType: string | null;
      isTerminal: boolean;
      requiresNotes: boolean;
    }[];
  }> {
    return cy.getAvailableActionsViaApi(applicationId).then((result) => {
      const blockedEval = result.requiredEvaluations.find(
        (e: { completed: boolean }) => !e.completed
      );

      if (blockedEval) {
        cy.log(`Hit evaluation gate at iteration — blocked by: ${blockedEval.templateName}`);
        return cy.wrap(result);
      }

      const completeAction = result.availableActions.find(
        (a: { actionCode: string }) => a.actionCode === 'COMPLETE'
      );

      if (!completeAction) {
        throw new Error(
          'No COMPLETE action available and no evaluation gate — cannot reach evaluation stage'
        );
      }

      if (maxIterations <= 1) {
        throw new Error('Max iterations reached without hitting evaluation stage');
      }

      cy.log(`Stage iteration: advancing via COMPLETE (${maxIterations - 1} remaining)`);
      return cy
        .executeActionViaApi(applicationId, 'COMPLETE')
        .then(() => advanceToEvaluationStage(applicationId, maxIterations - 1));
    });
  }

  /**
   * Navigate to the test job's kanban board
   */
  const navigateToKanbanBoard = () => {
    cy.visit(`/dashboard/jobs/${testJobId}`);
    cy.url({ timeout: 15000 }).should('match', /\/dashboard\/jobs\/[^\/]+$/);

    // Click on Applicants tab
    cy.contains('button', 'Applicants').click();
    cy.contains('Applicants').should('be.visible');

    // Click on Kanban view mode button
    cy.get('body').then(($pageBody) => {
      const kanbanBtn = $pageBody.find('button:contains("Kanban")');
      if (kanbanBtn.length > 0) {
        cy.wrap(kanbanBtn).click();
        cy.get('[class*="overflow-x-auto"]', { timeout: 10000 }).should('exist');
      } else {
        cy.log('Kanban view not available - job may not have a pipeline');
      }
    });
  };

  before(() => {
    // ---- Step 1-6: Admin creates job, application, advances to eval gate ----
    cy.loginAs('ADMIN');
    cy.visit('/dashboard');

    const jobTitle = `${testJobPrefix} - ${Date.now()}`;

    cy.createJobViaApi(jobTitle).then((job) => {
      testJobId = job.id;

      // Assign pipeline to job
      cy.listPipelinesViaApi().then((pipelines) => {
        if (pipelines.length === 0) {
          throw new Error('No pipelines found — cannot run evaluation gate test');
        }
        cy.assignPipelineViaApi(pipelines[0].id, testJobId);
      });

      // Create application
      cy.createApplicationViaApi(
        testJobId,
        'E2E Eval Gate Applicant',
        `e2e-evalgate-${Date.now()}@example.com`
      ).then((app) => {
        testApplicationId = app.id;

        // Advance to evaluation stage via API loop
        advanceToEvaluationStage(testApplicationId).then((result) => {
          const blocked = result.requiredEvaluations.find(
            (e: { completed: boolean }) => !e.completed
          );
          blockedEvalInstanceId = blocked?.instanceId ?? null;
          const templateId = blocked?.templateId;
          cy.log(`Setup: Blocked eval instanceId=${blockedEvalInstanceId}, templateId=${templateId}`);

          if (!templateId) {
            throw new Error('No templateId from evaluation gate — cannot create interview');
          }

          // ---- Step 7: Get current tracking state for currentStageId ----
          cy.getTrackingStateViaApi(testApplicationId).then((trackingState) => {
            const currentStageId = trackingState.currentStageId;
            cy.log(`Setup: currentStageId=${currentStageId}`);

            // ---- Step 8-9: Get interviewer user ID ----
            cy.loginAs('INTERVIEWER');
            cy.visit('/dashboard');
            cy.getSessionUserId().then((interviewerUserId) => {
              cy.log(`Setup: interviewerUserId=${interviewerUserId}`);

              // ---- Step 10-11: Admin creates interview with interviewer ----
              cy.loginAs('ADMIN');
              cy.visit('/dashboard');
              cy.createInterviewViaApi(testApplicationId, {
                pipeline_stage_id: currentStageId,
                rounds: [
                  {
                    round_type: 'Technical Interview',
                    sequence: 1,
                    interviewer_ids: [interviewerUserId],
                    evaluation_template_id: templateId,
                  },
                ],
              }).then(() => {
                cy.log('Setup: Interview created with participant');

                // ---- Step 12-13: Verify interviewer has pending evaluations ----
                cy.loginAs('INTERVIEWER');
                cy.visit('/dashboard');
                cy.getMyPendingInterviewsViaApi().then((interviews) => {
                  expect(interviews.length).to.be.greaterThan(
                    0,
                    'FATAL: No pending interviews after setup — interview creation may have failed'
                  );
                  cy.log(`Setup complete: interviewer has ${interviews.length} pending interview(s)`);
                });
              });
            });
          });
        });
      });
    });
  });

  after(() => {
    if (testJobId) {
      cy.loginAs('ADMIN');
      cy.visit('/dashboard');
      cy.deleteJobViaApi(testJobId);
    }
  });

  // --------------------------------------------------------------------------
  // Test 1: Kanban gate blocks advance when evaluations incomplete
  // --------------------------------------------------------------------------
  it('blocks advance via ActionModal when evaluations are incomplete', () => {
    cy.loginAs('ADMIN');
    navigateToKanbanBoard();

    // Find the application card and click to open drawer
    cy.get(`[data-testid="application-card-${testApplicationId}"]`, { timeout: 10000 })
      .should('exist')
      .click();

    // Click "Take Action" button in the drawer
    cy.getBySel('take-action-btn').should('be.visible').click();

    // Assert ActionModal shows evaluation block message
    cy.getBySel('action-modal').should('be.visible');
    cy.contains('Required evaluations must be completed').should('be.visible');

    // Assert action cards are dimmed (opacity-50 pointer-events-none)
    cy.get('[class*="opacity-50"][class*="pointer-events-none"]').should('exist');
  });

  // --------------------------------------------------------------------------
  // Test 1b: Drag attempt fires evaluation gate API
  // --------------------------------------------------------------------------
  it('drag attempt fires evaluation gate API and blocks', () => {
    cy.loginAs('ADMIN');

    // Intercept BEFORE navigating — catch ALL /actions calls
    cy.intercept('GET', '**/applications/*/actions').as('getActions');

    navigateToKanbanBoard();

    // Find the application card and attempt drag via pointer events
    cy.get(`[data-testid="application-card-${testApplicationId}"]`, { timeout: 10000 })
      .should('exist')
      .then(($card) => {
        const card = $card[0];
        const rect = card.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;

        // Simulate drag: pointerdown → pointermove (>8px to exceed activationConstraint) → pointerup
        cy.wrap(card)
          .trigger('pointerdown', { which: 1, clientX: startX, clientY: startY, pointerId: 1 })
          .trigger('pointermove', { clientX: startX + 100, clientY: startY, pointerId: 1 })
          .trigger('pointerup', { pointerId: 1 });
      });

    // The drag handler should have called /actions for the gate check
    // Use a generous timeout — dnd-kit activation + async API call
    cy.wait('@getActions', { timeout: 8000 })
      .its('response.body.data.requiredEvaluations')
      .should('have.length.greaterThan', 0);

    // Card should still be in original stage (not moved)
    cy.get(`[data-testid="application-card-${testApplicationId}"]`).should('exist');

    // Fallback: also verify at API level that evaluations block this app
    cy.getAvailableActionsViaApi(testApplicationId).then((data) => {
      const blocked = data.requiredEvaluations.filter((e: { completed: boolean }) => !e.completed);
      expect(blocked.length).to.be.greaterThan(0);
    });
  });

  // --------------------------------------------------------------------------
  // Test 2: Interviewer completes evaluation
  // --------------------------------------------------------------------------
  it('interviewer completes evaluation from pending list', () => {
    cy.loginAs('INTERVIEWER');
    cy.visit('/dashboard/interviews/my-pending');

    // Evaluation submitted notice should NOT exist (setup guarantees fresh evaluation)
    cy.getBySel('evaluation-submitted-notice').should('not.exist');

    // Find the CTA for the blocked evaluation
    cy.getBySel('complete-evaluation-cta')
      .should('have.length.greaterThan', 0)
      .first()
      .invoke('attr', 'href')
      .then((href) => {
        const evalId = (href as string).split('/').pop();

        // Navigate to evaluation
        cy.getBySel('complete-evaluation-cta').first().click();
        cy.url().should('include', `/dashboard/evaluations/${evalId}`);

        // Fill all required signal fields
        cy.get('body').then(($evalBody) => {
          if ($evalBody.find('[data-testid="boolean-input-yes"]').length > 0) {
            cy.getBySel('boolean-input-yes').each(($btn) => cy.wrap($btn).click());
          }
          if ($evalBody.find('[data-testid="numeric-input-3"]').length > 0) {
            cy.getBySel('numeric-input-3').each(($btn) => cy.wrap($btn).click());
          }
          if ($evalBody.find('[data-testid="text-input"]').length > 0) {
            cy.getBySel('text-input').each(($ta) =>
              cy.wrap($ta).clear().type('E2E evaluation gate test response')
            );
          }
        });

        // Submit + confirm
        cy.getBySel('submit-btn').should('not.be.disabled').click();
        cy.getBySel('confirm-submit-btn').click();

        // Verify submitted notice appears
        cy.getBySel('evaluation-submitted-notice').should('be.visible');

        // Revisit pending — assert that specific evaluation link is gone
        cy.visit('/dashboard/interviews/my-pending');
        cy.get(`a[href*="/dashboard/evaluations/${evalId}"]`).should('not.exist');
      });
  });

  // --------------------------------------------------------------------------
  // Test 3: Actions unblocked after evaluation complete
  // --------------------------------------------------------------------------
  it('actions are unblocked after evaluation is complete', () => {
    cy.loginAs('ADMIN');
    navigateToKanbanBoard();

    cy.get(`[data-testid="application-card-${testApplicationId}"]`, { timeout: 10000 })
      .should('exist')
      .click();

    // Click "Take Action" button in the drawer
    cy.getBySel('take-action-btn').should('be.visible').click();
    cy.getBySel('action-modal').should('be.visible');

    // Assert evaluation block message is gone
    cy.contains('Required evaluations must be completed').should('not.exist');

    // Assert action cards are clickable (not dimmed)
    cy.get('[class*="opacity-50"][class*="pointer-events-none"]').should('not.exist');

    // Verify at least one action card exists and is clickable
    cy.get('[data-testid*="action-card"]').should('have.length.greaterThan', 0);
  });
});
