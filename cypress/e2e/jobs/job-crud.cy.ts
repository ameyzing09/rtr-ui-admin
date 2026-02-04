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
    cy.visit('/dashboard/jobs');
  });

  it('should show delete confirmation modal', () => {
    // This test requires at least one job to exist
    cy.get('body').then(($body) => {
      // Check if there are job cards with action menus
      const hasJobs = $body.find('h3').length > 0;

      if (hasJobs) {
        // Open the action menu for the first job
        cy.get('button').filter(':visible').last().click({ force: true });

        // Click Delete Job option (if visible)
        cy.get('body').then(($menu) => {
          if ($menu.find(':contains("Delete Job")').length > 0) {
            cy.contains('Delete Job').click();

            // Confirm modal appears
            cy.contains('Delete').should('be.visible');
            cy.contains('Cancel').should('be.visible');

            // Cancel the deletion
            cy.contains('button', 'Cancel').click();
          }
        });
      }
    });
  });
});
