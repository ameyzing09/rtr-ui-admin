/**
 * Cypress E2E – Application Status Page Contract Stability
 *
 * Purpose: safety net against backend field removal or renaming.
 * Asserts that all 5 required rendered fields guaranteed by the public
 * status contract appear with non-empty, non-garbage values.
 *
 * This is NOT a behavior test — see candidate-application-status.cy.ts for that.
 * This test relies on: real backend → Zod validation → real UI render.
 * No mocks, no intercepts.
 */
describe('Public - Application Status Contract', () => {
  let testJobId: string;
  let accessToken: string;
  const jobTitle = `E2E Contract Test - ${Date.now()}`;
  const applicantEmail = `e2e-contract-${Date.now()}@example.com`;

  before(() => {
    cy.login(Cypress.env('ADMIN_EMAIL'), Cypress.env('ADMIN_PASSWORD'));
    cy.visit('/dashboard');

    cy.createJobViaApi(jobTitle).then((job) => {
      testJobId = job.id;

      cy.listPipelinesViaApi().then((pipelines) => {
        cy.assignPipelineViaApi(pipelines[0].id, job.id).then(() => {
          cy.submitPublicApplicationViaApi(job.id, 'E2E Contract Applicant', applicantEmail).then(
            (result) => {
              accessToken = result.candidate_access_token;
            }
          );
        });
      });
    });
  });

  after(() => {
    if (testJobId) {
      cy.login(Cypress.env('ADMIN_EMAIL'), Cypress.env('ADMIN_PASSWORD'));
      cy.visit('/dashboard');
      cy.deleteJobViaApi(testJobId);
    }
  });

  it('should render all contract fields with non-empty values', () => {
    cy.visit(`/careers/application/${accessToken}`);

    // Job title renders in h1
    cy.get('h1', { timeout: 15000 })
      .should('be.visible')
      .invoke('text')
      .should('not.be.empty');

    // Status card renders (Zod parsed successfully) with all contract fields
    cy.get('[data-testid="application-status-card"]')
      .should('be.visible')
      .within(() => {
        cy.contains('Status').should('be.visible');
        cy.contains('Current Stage').should('be.visible');
        cy.contains(/Applied on \w{3}/).should('be.visible');
        cy.contains(/Last updated on \w{3}/).should('be.visible');
      });

    // No undefined/null values leaked into rendered output
    cy.get('[data-testid="application-status-card"]')
      .invoke('text')
      .should('not.contain', 'undefined')
      .and('not.contain', 'null');

    // Back link renders
    cy.contains('a', 'View open positions').should('be.visible');
  });
});
