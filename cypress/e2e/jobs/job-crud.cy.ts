describe('Jobs - List View', () => {
  beforeEach(() => {
    const email = Cypress.env('ADMIN_EMAIL') || 'admin@test.com';
    const password = Cypress.env('ADMIN_PASSWORD') || 'test-password-123';
    cy.login(email, password);
    cy.visit('/dashboard/jobs');
  });

  it('should display the jobs list page', () => {
    // Check for search input
    cy.get('input[placeholder*="Search jobs"]').should('be.visible');

    // Check for Create Job button (if user has permission)
    cy.contains('Create Job').should('exist');
  });

  it('should have working search functionality', () => {
    // Type in search box
    cy.get('input[placeholder*="Search jobs"]').type('Engineer');

    // Wait for debounce and URL update
    cy.url().should('include', 'search=Engineer');
  });

  it('should navigate to create job page', () => {
    cy.contains('Create Job').click();
    cy.url().should('include', '/dashboard/jobs/create');
  });

  it('should show job count', () => {
    // Check for "Showing X jobs" text
    cy.contains(/Showing \d+ jobs?/).should('be.visible');
  });
});

describe('Jobs - Create Job Wizard', () => {
  beforeEach(() => {
    const email = Cypress.env('ADMIN_EMAIL') || 'admin@test.com';
    const password = Cypress.env('ADMIN_PASSWORD') || 'test-password-123';
    cy.login(email, password);
    cy.visit('/dashboard/jobs/create');
  });

  after(() => {
    // Cleanup: Delete all test jobs created during this test suite
    const email = Cypress.env('ADMIN_EMAIL') || 'admin@test.com';
    const password = Cypress.env('ADMIN_PASSWORD') || 'test-password-123';
    cy.login(email, password);
    cy.visit('/dashboard/jobs');

    // Recursively delete jobs with "E2E Test Job" prefix
    const deleteTestJobs = () => {
      cy.get('body').then(($body) => {
        const testJobs = $body.find('h3').filter((_, el) => {
          return Cypress.$(el).text().includes('E2E Test Job');
        });

        if (testJobs.length > 0) {
          // Click the action menu for the first test job
          // DOM structure: h3 -> Link -> div.flex-1 -> div.flex.justify-between -> find button
          cy.wrap(testJobs.first())
            .parent() // Link
            .parent() // div.flex-1
            .parent() // div.flex.justify-between
            .find('button')
            .click({ force: true });
          // Menu is rendered via Portal to document.body
          cy.contains('Delete Job').click();
          cy.contains('button', 'Delete').click();
          cy.wait(500);
          deleteTestJobs();
        }
      });
    };

    deleteTestJobs();
  });

  it('should display the job creation wizard', () => {
    // Check wizard step indicators
    cy.contains('Basic Information').should('be.visible');

    // Check for form fields in step 1
    cy.contains('Job Title').should('be.visible');
  });

  it('should validate required fields on step 1', () => {
    // Try to proceed without filling required fields
    cy.contains('button', 'Next').click();

    // Should show validation error
    cy.contains('required').should('be.visible');
  });

  it('should navigate through wizard steps', () => {
    // Fill in step 1 - Basic Information
    cy.get('input').first().type('Test Software Engineer');

    // Click Next
    cy.contains('button', 'Next').click();

    // Should be on step 2
    cy.contains('Description').should('be.visible');

    // Click Next to step 3
    cy.contains('button', 'Next').click();

    // Should be on step 3
    cy.contains('Visibility').should('be.visible');

    // Click Next to step 4
    cy.contains('button', 'Next').click();

    // Should be on step 4
    cy.contains('Custom Fields').should('be.visible');
  });

  it('should allow going back through wizard steps', () => {
    // Fill step 1 - use specific ID selector for title input
    cy.get('#title').type('Test Job');
    cy.contains('button', 'Next').click();

    // Should be on step 2 - the URL might update or h2 changes
    // Wait for step 1 header to disappear and step 2 to appear
    cy.contains('h2', 'Basic Information').should('not.exist');

    // Click Previous button
    cy.get('button').contains('Previous').click();

    // Should be back on step 1 with data preserved
    cy.contains('h2', 'Basic Information').should('be.visible');
    cy.get('#title').should('have.value', 'Test Job');
  });

  it('should show cancel confirmation', () => {
    // Type something first
    cy.get('input').first().type('Test Job');

    // Click Cancel
    cy.contains('button', 'Cancel').click();

    // Should show confirmation dialog
    cy.on('window:confirm', (text) => {
      expect(text).to.contains('cancel');
      return false; // Click "No" to stay on page
    });
  });

  it('should create a new job successfully', () => {
    // Wait for the form to be ready
    cy.contains('Job Title').should('be.visible');

    // Step 1: Basic Information - use specific ID selector
    cy.get('#title').type('E2E Test Job - ' + Date.now());
    cy.contains('button', 'Next').click();

    // Step 2: Wait for step 1 to disappear, then proceed
    cy.contains('h2', 'Basic Information').should('not.exist');
    cy.contains('button', 'Next').click();

    // Step 3: Wait for step 2 to complete
    cy.get('button').contains('Next').click();

    // Step 4: Submit
    cy.get('button').contains('Submit').click();

    // Should redirect to job detail or jobs list on success
    cy.url({ timeout: 15000 }).should('match', /\/dashboard\/jobs/);

    // Should show success toast
    cy.contains('created successfully').should('be.visible');
  });
});

describe('Jobs - View and Edit', () => {
  beforeEach(() => {
    const email = Cypress.env('ADMIN_EMAIL') || 'admin@test.com';
    const password = Cypress.env('ADMIN_PASSWORD') || 'test-password-123';
    cy.login(email, password);
  });

  it('should view job details', () => {
    cy.visit('/dashboard/jobs');

    // Click on first job card title (if exists)
    cy.get('body').then(($body) => {
      if ($body.find('h3').length > 0) {
        cy.get('h3').first().click();
        cy.url().should('match', /\/dashboard\/jobs\/[\w-]+$/);
      }
    });
  });

  it('should open job actions menu', () => {
    cy.visit('/dashboard/jobs');

    // Find and click the more menu button on a job card (if exists)
    cy.get('body').then(($body) => {
      if ($body.find('button').filter(':has(svg)').length > 0) {
        // Look for the MoreVertical button
        cy.get('button').filter(':visible').contains('svg').first().click({ force: true });
      }
    });
  });
});

describe('Jobs - Delete', () => {
  beforeEach(() => {
    const email = Cypress.env('ADMIN_EMAIL') || 'admin@test.com';
    const password = Cypress.env('ADMIN_PASSWORD') || 'test-password-123';
    cy.login(email, password);
  });

  it('should delete a job with confirmation', () => {
    // First create a job specifically for this delete test
    cy.visit('/dashboard/jobs/create');
    const deleteTestJobTitle = 'E2E Test Job Delete - ' + Date.now();

    // Wait for the form to be ready
    cy.contains('Job Title').should('be.visible');

    // Step 1: Basic Information
    cy.get('#title').type(deleteTestJobTitle);
    cy.contains('button', 'Next').click();

    // Step 2: Wait for step 1 to disappear, then proceed
    cy.contains('h2', 'Basic Information').should('not.exist');
    cy.contains('button', 'Next').click();

    // Step 3: Wait for step 2 to complete
    cy.get('button').contains('Next').click();

    // Step 4: Submit
    cy.get('button').contains('Submit').click();

    // Should show success toast
    cy.contains('created successfully', { timeout: 15000 }).should('be.visible');

    // Go back to jobs list
    cy.visit('/dashboard/jobs');
    cy.contains(deleteTestJobTitle, { timeout: 10000 }).should('be.visible');

    // Find and delete the job
    // DOM structure: h3 -> Link -> div.flex-1 -> div.flex.justify-between -> find button
    cy.contains('h3', deleteTestJobTitle)
      .parent() // Link
      .parent() // div.flex-1
      .parent() // div.flex.justify-between
      .find('button')
      .click({ force: true });
    // Menu is rendered via Portal to document.body
    cy.contains('Delete Job').click();

    // Confirmation modal should appear
    cy.contains('Delete').should('be.visible');
    cy.contains('Cancel').should('be.visible');

    // Actually confirm deletion
    cy.contains('button', 'Delete').click();

    // Job should be removed
    cy.contains(deleteTestJobTitle).should('not.exist');
  });
});
