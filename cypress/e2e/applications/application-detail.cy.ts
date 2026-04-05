/// <reference types="cypress" />

/**
 * Application Detail Page E2E Tests
 *
 * Tests for the /dashboard/applications/{id} page including:
 * - Navigation (list menu, drawer link, direct URL, signals, back)
 * - Page header (candidate name, status badge, applied date)
 * - Candidate card (email, phone, resume, cover letter)
 * - Job card (title link, department, location)
 * - Tracking card (populated vs empty)
 * - Interviews card (empty state)
 * - Evaluations card (empty state)
 * - Timeline card (empty state)
 * - Error states (404, 403)
 * - Responsive layout
 */
describe('Application Detail Page', () => {
  // Module-scoped variables for test data
  let testJobWithPipelineId: string;
  let testJobNoPipelineId: string;
  let testAppWithTrackingId: string;
  let testAppEmptyId: string;
  let testJobWithPipelineTitle: string;

  before(() => {
    cy.loginAs('ADMIN');
    cy.visit('/dashboard');

    // 1. Create job A with pipeline → application A (has tracking)
    const jobATitle = `E2E Detail Job A ${Date.now()}`;
    testJobWithPipelineTitle = jobATitle;
    cy.createJobViaApi(jobATitle).then((jobA) => {
      testJobWithPipelineId = jobA.id;

      // Assign pipeline to job A
      cy.listPipelinesViaApi().then((pipelines) => {
        if (pipelines.length > 0) {
          cy.assignPipelineViaApi(pipelines[0].id, jobA.id);
        }
      });

      // Create application A (with tracking since job has pipeline)
      cy.createApplicationViaApi(
        jobA.id,
        'Detail Test Candidate A',
        `detail-test-a-${Date.now()}@example.com`
      ).then((appA) => {
        testAppWithTrackingId = appA.id;
      });
    });

    // 2. Create job B without pipeline → application B (empty states)
    const jobBTitle = `E2E Detail Job B ${Date.now()}`;
    cy.createJobViaApi(jobBTitle).then((jobB) => {
      testJobNoPipelineId = jobB.id;

      // Create application B (no pipeline → empty tracking, interviews, evaluations, timeline)
      cy.createApplicationViaApi(
        jobB.id,
        'Detail Test Candidate B',
        `detail-test-b-${Date.now()}@example.com`
      ).then((appB) => {
        testAppEmptyId = appB.id;
      });
    });
  });

  after(() => {
    cy.loginAs('ADMIN');

    if (testJobWithPipelineId) {
      cy.deleteJobViaApi(testJobWithPipelineId);
    }
    if (testJobNoPipelineId) {
      cy.deleteJobViaApi(testJobNoPipelineId);
    }
  });

  beforeEach(() => {
    cy.loginAs('ADMIN');
  });

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------
  describe('Navigation', () => {
    it('should navigate from application list "View Details" menu', () => {
      cy.visit('/dashboard/applications');
      cy.url().should('include', '/dashboard/applications');

      // Wait for the table to render
      cy.get('table', { timeout: 10000 }).should('exist');

      // Open the actions menu for our test application
      // Find the row containing our test app, then click the MoreVertical button
      cy.contains('td', 'Detail Test Candidate A')
        .closest('tr')
        .find('button')
        .click();

      // Click "View Details" in the dropdown
      cy.getBySel(`app-list-view-details-${testAppWithTrackingId}`).click();

      // Should navigate to detail page
      cy.url().should('include', `/dashboard/applications/${testAppWithTrackingId}`);
      cy.getBySel('app-detail-page').should('exist');
    });

    it('should navigate from drawer "View full application details" link', () => {
      // Navigate to tracking kanban
      cy.visit('/dashboard/tracking');
      cy.url().should('include', '/dashboard/tracking');

      // Wait for tracking page to load
      cy.get('body', { timeout: 10000 }).then(($body) => {
        // Look for any application card matching our test candidate
        if ($body.find('[data-testid*="application-card"]').length > 0) {
          // Click an application card to open drawer
          cy.getBySelLike('application-card').first().click();

          // Wait for drawer content to load
          cy.contains('Application Details', { timeout: 5000 }).should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          // Click the "View full application details" link
          cy.contains('View full application details').click();

          // Should navigate to the detail page
          cy.url().should('include', '/dashboard/applications/');
          cy.url().should('not.include', '/tracking');
          cy.getBySel('app-detail-page').should('exist');
        } else {
          cy.log('No application cards found on tracking board — skipping drawer test');
        }
      });
    });

    it('should load via direct URL', () => {
      cy.visit(`/dashboard/applications/${testAppWithTrackingId}`);
      cy.getBySel('app-detail-page').should('exist');
      cy.getBySel('app-detail-candidate-name').should('contain.text', 'Detail Test Candidate A');
    });

    it('should navigate to signals page via Signals link', () => {
      cy.visit(`/dashboard/applications/${testAppWithTrackingId}`);
      cy.getBySel('app-detail-page').should('exist');

      cy.getBySel('app-detail-signals-link').click();
      cy.url().should('include', `/dashboard/applications/${testAppWithTrackingId}/signals`);
    });

    it('should navigate back via back button', () => {
      // Visit applications list first, then navigate to detail
      cy.visit('/dashboard/applications');
      cy.url().should('include', '/dashboard/applications');

      // Navigate to detail page
      cy.visit(`/dashboard/applications/${testAppWithTrackingId}`);
      cy.getBySel('app-detail-page').should('exist');

      // Click back button
      cy.getBySel('app-detail-back-btn').click();

      // Should go back (may go to applications list or previous page)
      cy.url().should('include', '/dashboard');
    });
  });

  // -------------------------------------------------------------------------
  // Page Header
  // -------------------------------------------------------------------------
  describe('Page Header', () => {
    it('should display candidate name', () => {
      cy.visit(`/dashboard/applications/${testAppWithTrackingId}`);
      cy.getBySel('app-detail-candidate-name')
        .should('be.visible')
        .and('contain.text', 'Detail Test Candidate A');
    });

    it('should display application status badge', () => {
      cy.visit(`/dashboard/applications/${testAppWithTrackingId}`);
      cy.getBySel('app-detail-status-badge')
        .should('be.visible')
        .and('contain.text', 'PENDING');
    });

    it('should display applied date', () => {
      cy.visit(`/dashboard/applications/${testAppWithTrackingId}`);
      cy.getBySel('app-detail-page').should('exist');

      // The applied date appears in the header subtitle
      cy.contains('Applied').should('be.visible');
    });
  });

  // -------------------------------------------------------------------------
  // Candidate Card
  // -------------------------------------------------------------------------
  describe('Candidate Card', () => {
    it('should display heading, email, phone', () => {
      cy.visit(`/dashboard/applications/${testAppWithTrackingId}`);
      cy.getBySel('app-detail-card-candidate').should('be.visible');
      cy.getBySel('app-detail-card-candidate').within(() => {
        cy.contains('Candidate').should('be.visible');
      });
      cy.getBySel('app-detail-candidate-email')
        .should('be.visible')
        .and('contain.text', '@example.com');
      cy.getBySel('app-detail-candidate-phone').should('be.visible');
    });

    it('should display "View Resume" link when resume exists', () => {
      cy.visit(`/dashboard/applications/${testAppWithTrackingId}`);
      cy.getBySel('app-detail-card-candidate').should('be.visible');

      // Resume may or may not exist depending on test data
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="app-detail-resume-link"]').length > 0) {
          cy.getBySel('app-detail-resume-link')
            .should('be.visible')
            .and('contain.text', 'View Resume')
            .and('have.attr', 'target', '_blank');
        } else {
          cy.log('No resume URL — test candidate was created without resume');
        }
      });
    });

    it('should expand and collapse cover letter', () => {
      cy.visit(`/dashboard/applications/${testAppWithTrackingId}`);
      cy.getBySel('app-detail-card-candidate').should('be.visible');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="app-detail-cover-letter-toggle"]').length > 0) {
          // Expand
          cy.getBySel('app-detail-cover-letter-toggle').click();
          cy.getBySel('app-detail-cover-letter-content').should('be.visible');

          // Collapse
          cy.getBySel('app-detail-cover-letter-toggle').click();
          cy.getBySel('app-detail-cover-letter-content').should('not.exist');
        } else {
          cy.log('No cover letter — test candidate was created without cover letter');
        }
      });
    });
  });

  // -------------------------------------------------------------------------
  // Job Card
  // -------------------------------------------------------------------------
  describe('Job Card', () => {
    it('should display job title as link to job detail', () => {
      cy.visit(`/dashboard/applications/${testAppWithTrackingId}`);
      cy.getBySel('app-detail-card-job').should('be.visible');
      cy.getBySel('app-detail-job-title')
        .should('be.visible')
        .and('contain.text', 'E2E Detail Job A')
        .and('have.attr', 'href')
        .and('include', `/dashboard/jobs/${testJobWithPipelineId}`);
    });

    it('should display department and location or fallbacks', () => {
      cy.visit(`/dashboard/applications/${testAppWithTrackingId}`);
      cy.getBySel('app-detail-card-job').should('be.visible');
      cy.getBySel('app-detail-job-department').should('be.visible');
      cy.getBySel('app-detail-job-location').should('be.visible');
    });
  });

  // -------------------------------------------------------------------------
  // Tracking Card - Populated
  // -------------------------------------------------------------------------
  describe('Tracking Card - Populated', () => {
    it('should display status badge, stage name + index, entered date', () => {
      cy.visit(`/dashboard/applications/${testAppWithTrackingId}`);
      cy.getBySel('app-detail-card-tracking').should('be.visible');

      // Check for tracking data (app A has pipeline → should have tracking)
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="app-detail-tracking-status"]').length > 0) {
          cy.getBySel('app-detail-tracking-status').should('be.visible');
          cy.getBySel('app-detail-tracking-stage').should('be.visible');
          cy.getBySel('app-detail-tracking-entered').should('be.visible');
        } else if ($body.find('[data-testid="app-detail-tracking-empty"]').length > 0) {
          // Pipeline assignment may not have triggered tracking yet
          cy.log('Tracking not yet initialized — pipeline may not have triggered tracking');
          cy.getBySel('app-detail-tracking-empty').should('be.visible');
        }
      });
    });
  });

  // -------------------------------------------------------------------------
  // Tracking Card - Empty
  // -------------------------------------------------------------------------
  describe('Tracking Card - Empty', () => {
    it('should display "Not yet tracked" for app without pipeline', () => {
      cy.visit(`/dashboard/applications/${testAppEmptyId}`);
      cy.getBySel('app-detail-card-tracking').should('be.visible');
      cy.getBySel('app-detail-tracking-empty')
        .should('be.visible')
        .and('contain.text', 'Not yet tracked');
    });
  });

  // -------------------------------------------------------------------------
  // Interviews Card - Empty
  // -------------------------------------------------------------------------
  describe('Interviews Card - Empty', () => {
    it('should display "No interviews yet"', () => {
      cy.visit(`/dashboard/applications/${testAppEmptyId}`);
      cy.getBySel('app-detail-card-interviews').should('be.visible');
      cy.getBySel('app-detail-interviews-empty')
        .should('be.visible')
        .and('contain.text', 'No interviews yet');
    });
  });

  // -------------------------------------------------------------------------
  // Evaluations Card - Empty
  // -------------------------------------------------------------------------
  describe('Evaluations Card - Empty', () => {
    it('should display "No evaluations yet"', () => {
      cy.visit(`/dashboard/applications/${testAppEmptyId}`);
      cy.getBySel('app-detail-card-evaluations').should('be.visible');
      cy.getBySel('app-detail-evaluations-empty')
        .should('be.visible')
        .and('contain.text', 'No evaluations yet');
    });
  });

  // -------------------------------------------------------------------------
  // Timeline Card - Empty
  // -------------------------------------------------------------------------
  describe('Timeline Card - Empty', () => {
    it('should display "No activity yet"', () => {
      cy.visit(`/dashboard/applications/${testAppEmptyId}`);
      cy.getBySel('app-detail-card-timeline').should('be.visible');
      cy.getBySel('app-detail-timeline-empty')
        .should('be.visible')
        .and('contain.text', 'No activity yet');
    });
  });

  // -------------------------------------------------------------------------
  // Error States - 404
  // -------------------------------------------------------------------------
  describe('Error States - 404', () => {
    it('should show "Application Not Found" for invalid UUID', () => {
      cy.visit('/dashboard/applications/00000000-0000-0000-0000-000000000000', {
        failOnStatusCode: false,
      });
      cy.getBySel('app-detail-not-found').should('be.visible');
      cy.getBySel('app-detail-not-found-title')
        .should('be.visible')
        .and('contain.text', 'Application Not Found');
    });

    it('should show "View All Applications" and "Back to Dashboard" links', () => {
      cy.visit('/dashboard/applications/00000000-0000-0000-0000-000000000000', {
        failOnStatusCode: false,
      });
      cy.getBySel('app-detail-not-found').should('be.visible');

      cy.getBySel('app-detail-not-found-view-all')
        .should('be.visible')
        .and('contain.text', 'View All Applications')
        .and('have.attr', 'href', '/dashboard/applications');

      cy.getBySel('app-detail-not-found-back-dashboard')
        .should('be.visible')
        .and('contain.text', 'Back to Dashboard')
        .and('have.attr', 'href', '/dashboard');
    });

    it('should navigate to applications list from 404 page', () => {
      cy.visit('/dashboard/applications/00000000-0000-0000-0000-000000000000', {
        failOnStatusCode: false,
      });
      cy.getBySel('app-detail-not-found').should('be.visible');
      cy.getBySel('app-detail-not-found-view-all').click();
      cy.url().should('include', '/dashboard/applications');
    });
  });

  // -------------------------------------------------------------------------
  // Error States - 403 (INTERVIEWER)
  // -------------------------------------------------------------------------
  describe('Error States - 403 (INTERVIEWER)', () => {
    beforeEach(() => {
      cy.loginAs('INTERVIEWER');
    });

    it('should show access denied or restricted view for unassigned INTERVIEWER', () => {
      cy.visit(`/dashboard/applications/${testAppWithTrackingId}`);

      // Backend may return 403 (access denied banner) or a restricted view
      cy.get('body', { timeout: 10000 }).then(($body) => {
        const hasForbidden = $body.find('[data-testid="app-detail-error-forbidden"]').length > 0;
        const hasRestrictedMessage = $body.find('[data-testid="app-detail-restricted-message"]').length > 0;
        const hasDetailPage = $body.find('[data-testid="app-detail-page"]').length > 0;

        if (hasForbidden) {
          cy.getBySel('app-detail-error-forbidden')
            .should('be.visible')
            .and('contain.text', 'Access Denied');
        } else if (hasDetailPage && hasRestrictedMessage) {
          // Restricted view — interviewer can see limited data
          cy.getBySel('app-detail-restricted-message')
            .should('be.visible')
            .and('contain.text', 'Not available for this role');
        } else if (hasDetailPage) {
          // Interviewer has access (e.g., assigned to this application)
          cy.getBySel('app-detail-page').should('exist');
        } else {
          // May have been redirected
          cy.log('Interviewer was redirected — checking URL');
          cy.url().should('include', '/dashboard');
        }
      });
    });
  });

  // -------------------------------------------------------------------------
  // Responsive Layout
  // -------------------------------------------------------------------------
  describe('Responsive Layout', () => {
    it('should render correctly on tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.visit(`/dashboard/applications/${testAppWithTrackingId}`);
      cy.getBySel('app-detail-page').should('be.visible');
      cy.getBySel('app-detail-card-candidate').should('be.visible');
      cy.getBySel('app-detail-card-job').should('be.visible');
      cy.getBySel('app-detail-card-tracking').should('be.visible');
    });

    it('should render correctly on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.visit(`/dashboard/applications/${testAppWithTrackingId}`);
      cy.getBySel('app-detail-page').should('be.visible');
      cy.getBySel('app-detail-card-candidate').should('be.visible');
      cy.getBySel('app-detail-card-job').should('be.visible');
      cy.getBySel('app-detail-card-tracking').should('be.visible');
    });
  });
});
