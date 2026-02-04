describe('Dashboard Home', () => {
  beforeEach(() => {
    // Login before each test
    const email = Cypress.env('ADMIN_EMAIL') || 'admin@test.com';
    const password = Cypress.env('ADMIN_PASSWORD') || 'test-password-123';
    cy.login(email, password);
    cy.visit('/dashboard');
  });

  it('should display the dashboard page header', () => {
    cy.contains('h1', 'Recruitment Dashboard').should('be.visible');
    cy.contains('Track hiring performance').should('be.visible');
  });

  it('should display stat cards', () => {
    // Check for the four stat cards
    cy.contains('Open Roles').should('be.visible');
    cy.contains('Active Candidates').should('be.visible');
    cy.contains('Interviews Today').should('be.visible');
    cy.contains('Offers This Month').should('be.visible');
  });

  it('should display the hiring pipeline chart card', () => {
    cy.contains('Hiring Pipeline').should('be.visible');
    cy.contains('Funnel across stages').should('be.visible');
  });

  it('should display recent activity', () => {
    cy.contains('Recent Activity').should('be.visible');
    // Check that activity items are rendered
    cy.contains('minutes ago').should('exist');
  });

  it('should display quick actions', () => {
    cy.contains('Quick Actions').should('be.visible');
    cy.contains('Post New Job').should('be.visible');
    cy.contains('Invite Candidate').should('be.visible');
    cy.contains('Schedule Interview').should('be.visible');
  });

  it('should display system status', () => {
    cy.contains('System Status').should('be.visible');
    cy.contains('Job Board API').should('be.visible');
    cy.contains('Scheduler').should('be.visible');
  });

  it('should display notifications', () => {
    cy.contains('Recent Notifications').should('be.visible');
  });

  it('should have working navigation sidebar', () => {
    // Check that sidebar is present and has navigation links
    cy.get('nav').should('be.visible');

    // Click on Job Postings in navigation (under Recruitment section)
    cy.contains('a', 'Job Postings').click();
    cy.url().should('include', '/dashboard/jobs');

    // Navigate back to dashboard
    cy.contains('a', 'Dashboard').click();
    cy.url().should('include', '/dashboard');
  });

  it('should navigate to jobs page via quick action', () => {
    // Click the Post New Job button in Quick Actions
    cy.contains('button', 'Post New Job').click();

    // Should navigate or trigger action
    // Note: This depends on your implementation - adjust as needed
  });
});

describe('Dashboard - Responsive Layout', () => {
  beforeEach(() => {
    const email = Cypress.env('ADMIN_EMAIL') || 'admin@test.com';
    const password = Cypress.env('ADMIN_PASSWORD') || 'test-password-123';
    cy.login(email, password);
  });

  it('should display properly on tablet viewport', () => {
    cy.viewport(768, 1024);
    cy.visit('/dashboard');

    cy.contains('h1', 'Recruitment Dashboard').should('be.visible');
    cy.contains('Open Roles').should('be.visible');
  });

  it('should display properly on mobile viewport', () => {
    cy.viewport(375, 667);
    cy.visit('/dashboard');

    cy.contains('h1', 'Recruitment Dashboard').should('be.visible');
    // Stat cards should stack on mobile
    cy.contains('Open Roles').should('be.visible');
  });
});
