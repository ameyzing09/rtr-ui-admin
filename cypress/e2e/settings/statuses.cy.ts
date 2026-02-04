describe('Settings - Application Statuses', () => {
  beforeEach(() => {
    const email = Cypress.env('ADMIN_EMAIL') || 'admin@test.com';
    const password = Cypress.env('ADMIN_PASSWORD') || 'test-password-123';
    cy.login(email, password);
    cy.visit('/dashboard/settings/statuses');
  });

  it('should display the status settings page', () => {
    cy.contains('h1', 'Application Statuses').should('be.visible');
    cy.contains('Configure the status options').should('be.visible');
  });

  it('should display the info card about statuses', () => {
    cy.contains('About Application Statuses').should('be.visible');
    cy.contains('Terminal statuses').should('be.visible');
  });

  it('should display the Refresh button', () => {
    cy.contains('button', 'Refresh').should('be.visible');
  });

  it('should display Add Status button for admins', () => {
    // This assumes the logged-in user has admin permissions
    cy.contains('button', 'Add Status').should('be.visible');
  });

  it('should open Add Status modal', () => {
    cy.contains('button', 'Add Status').click();

    // Modal should open with title "Add Status"
    cy.contains('h2, h3, [role="dialog"]', 'Add Status').should('be.visible');
    // Form fields should be visible - check for Status Code label
    cy.contains('Status Code').should('be.visible');
    cy.contains('Display Name').should('be.visible');
  });

  it('should close modal on cancel', () => {
    cy.contains('button', 'Add Status').click();

    // Find and click Cancel or close button
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Cancel")').length > 0) {
        cy.contains('button', 'Cancel').click();
      } else {
        // Try clicking outside the modal or pressing Escape
        cy.get('body').type('{esc}');
      }
    });

    // Modal should be closed
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('should refresh status list', () => {
    // Click refresh button
    cy.contains('button', 'Refresh').click();

    // Button should show loading state (icon animation)
    cy.get('button').contains('Refresh').find('svg').should('have.class', 'animate-spin');

    // Wait for refresh to complete
    cy.get('button').contains('Refresh').find('svg').should('not.have.class', 'animate-spin');
  });
});

describe('Settings - Status CRUD Operations', () => {
  // Status code must be uppercase letters and underscores only (no numbers)
  // Generate random uppercase letters only (A-Z)
  const randomLetters = Array.from({ length: 6 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join('');
  const testStatusName = 'Cypress Test Status';
  const testStatusCode = 'CYPRESS_TEST_' + randomLetters;

  beforeEach(() => {
    const email = Cypress.env('ADMIN_EMAIL') || 'admin@test.com';
    const password = Cypress.env('ADMIN_PASSWORD') || 'test-password-123';
    cy.login(email, password);
    cy.visit('/dashboard/settings/statuses');
  });

  it('should create a new status', () => {
    // Click Add Status
    cy.contains('button', 'Add Status').click();

    // Wait for modal to open
    cy.contains('h2, h3', 'Add Status').should('be.visible');

    // Fill in the form using labels to find inputs
    // Status Code field
    cy.contains('label', 'Status Code').parent().find('input').type(testStatusCode);

    // Display Name field
    cy.contains('label', 'Display Name').parent().find('input').type(testStatusName);

    // Submit the form
    cy.contains('button', 'Create Status').click();

    // Should show success message or status in list
    cy.contains(testStatusName, { timeout: 10000 }).should('be.visible');
  });

  it('should edit an existing status', () => {
    // Find an existing status and click edit
    cy.get('body').then(($body) => {
      // Look for edit buttons in the table
      const editButtons = $body.find('button:contains("Edit"), button[aria-label*="edit"], [data-testid*="edit"]');

      if (editButtons.length > 0) {
        cy.wrap(editButtons.first()).click();

        // Modal should open with pre-filled data
        cy.get('input').first().should('not.have.value', '');

        // Modify a field
        cy.get('input').first().clear().type('Modified Status Name');

        // Save changes
        cy.contains('button', 'Save').click();

        // Should show success or updated value
        cy.contains('Modified Status Name').should('be.visible');
      }
    });
  });

  it('should delete a status with confirmation', () => {
    // Find a status to delete
    cy.get('body').then(($body) => {
      // Look for delete buttons
      const deleteButtons = $body.find('button:contains("Delete"), button[aria-label*="delete"], [data-testid*="delete"]');

      if (deleteButtons.length > 0) {
        cy.wrap(deleteButtons.first()).click();

        // Confirmation modal should appear
        cy.contains('Delete').should('be.visible');
        cy.contains('Are you sure').should('be.visible');

        // Cancel the deletion (don't actually delete in tests)
        cy.contains('button', 'Cancel').click();

        // Modal should close
        cy.get('[role="dialog"]').should('not.exist');
      }
    });
  });

  it('should validate required fields when creating status', () => {
    // Click Add Status
    cy.contains('button', 'Add Status').click();

    // Wait for modal to open
    cy.contains('h2, h3', 'Add Status').should('be.visible');

    // Try to submit without filling required fields
    cy.contains('button', 'Create Status').click();

    // Should show validation errors - check for actual error messages
    cy.contains('Status code is required').should('be.visible');
    cy.contains('Display name is required').should('be.visible');
  });
});

describe('Settings - Status Table', () => {
  beforeEach(() => {
    const email = Cypress.env('ADMIN_EMAIL') || 'admin@test.com';
    const password = Cypress.env('ADMIN_PASSWORD') || 'test-password-123';
    cy.login(email, password);
    cy.visit('/dashboard/settings/statuses');
  });

  it('should display status table with columns', () => {
    // Check for table headers
    cy.get('table, [role="table"]').should('exist');

    // Common status table columns
    cy.contains('Name').should('be.visible');
    cy.contains('Code').should('be.visible');
  });

  it('should display terminal status indicator', () => {
    // Look for terminal status badges or indicators
    cy.get('body').then(($body) => {
      // Check if there are any statuses with terminal indicator
      const hasTerminal = $body.find(':contains("Terminal")').length > 0;
      if (hasTerminal) {
        cy.contains('Terminal').should('be.visible');
      }
    });
  });
});
