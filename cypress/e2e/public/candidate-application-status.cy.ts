/**
 * Cypress E2E tests for Public Application Status Page
 * Token-only: setup creates a token via API, tests only exercise /careers/application/{token}
 *
 * Design principle: Application status lookup is token-authoritative, not tenant-authoritative.
 */
describe('Public - Application Status Page', () => {
  let testJobId: string;
  let accessToken: string;
  const jobTitle = `E2E Status Test - ${Date.now()}`;
  const applicantEmail = `e2e-status-${Date.now()}@example.com`;

  before(() => {
    // Setup: create job, assign pipeline, then submit application via public API to get token
    cy.login(Cypress.env('ADMIN_EMAIL'), Cypress.env('ADMIN_PASSWORD'));
    cy.visit('/dashboard');

    cy.createJobViaApi(jobTitle).then((job) => {
      testJobId = job.id;

      // Job must have a pipeline assigned before it can accept applications
      cy.listPipelinesViaApi().then((pipelines) => {
        cy.assignPipelineViaApi(pipelines[0].id, job.id).then(() => {
          cy.submitPublicApplicationViaApi(job.id, 'E2E Status Applicant', applicantEmail).then(
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

  it('should display application status for a valid token', () => {
    cy.visit(`/careers/application/${accessToken}`);

    cy.get('h1', { timeout: 15000 }).should('contain.text', jobTitle);
    cy.contains('Status').should('be.visible');
    cy.contains('Current Stage').should('be.visible');
    cy.contains('Applied').should('be.visible');
    cy.contains('Last updated').should('be.visible');
    cy.contains('View open positions').should('be.visible');
  });

  it('should show "Application not found" for invalid token', () => {
    cy.visit('/careers/application/00000000-0000-0000-0000-000000000000');
    cy.contains('Application not found', { timeout: 15000 }).should('be.visible');
  });

  it('should show "Application not found" for malformed token', () => {
    cy.visit('/careers/application/not-a-valid-uuid-at-all');
    cy.contains('Application not found', { timeout: 15000 }).should('be.visible');
  });
});
