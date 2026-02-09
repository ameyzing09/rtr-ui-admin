/**
 * Cypress E2E test for Public Candidate Apply Flow
 * Tests: /careers → find job → fill form → submit → token returned
 *
 * Tenant-dependent: requires admin auth to create a test job
 */
describe('Public - Candidate Apply Flow', () => {
  let testJobId: string;
  const jobTitle = `E2E Apply Test - ${Date.now()}`;
  const applicantEmail = `e2e-apply-${Date.now()}@example.com`;

  before(() => {
    cy.login(Cypress.env('ADMIN_EMAIL'), Cypress.env('ADMIN_PASSWORD'));
    cy.visit('/dashboard');

    cy.createJobViaApi(jobTitle).then((job) => {
      testJobId = job.id;

      // Job must have a pipeline assigned before it can accept applications
      cy.listPipelinesViaApi().then((pipelines) => {
        cy.assignPipelineViaApi(pipelines[0].id, job.id);
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

  it('should submit an application from the careers page and receive a token', () => {
    // 1. Visit careers page and find the test job
    cy.visit('/careers');
    cy.contains('h3', jobTitle, { timeout: 15000 }).should('be.visible').click();

    // 2. Fill out the application form
    cy.get('#applicantName').type('E2E Test Applicant');
    cy.get('#applicantEmail').type(applicantEmail);
    cy.get('#applicantPhone').type('+1-555-0199');
    cy.get('#coverLetter').type('E2E test cover letter for the apply flow.');

    // 3. Intercept the submit request to capture the response
    cy.intercept('POST', '/api/public/applications').as('submitApplication');

    // 4. Submit the application
    cy.contains('button', 'Submit Application').click();

    // 5. Assert success state
    cy.contains('h3', 'Application Submitted!', { timeout: 15000 }).should('be.visible');

    // 6. Verify response contains a valid candidate_access_token
    cy.wait('@submitApplication').then((interception) => {
      expect(interception.response?.statusCode).to.eq(201);
      const token = interception.response?.body?.candidate_access_token;
      expect(token).to.be.a('string').and.not.be.empty;
      expect(token).to.match(/^[0-9a-fA-F-]{36}$/);
    });
  });
});
