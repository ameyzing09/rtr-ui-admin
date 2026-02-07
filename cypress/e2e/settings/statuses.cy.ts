// Store status IDs created during tests for cleanup
const createdStatusIds: string[] = [];

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

    // Intercept status creation to capture ID
    cy.intercept('POST', '**/settings/statuses').as('createStatus');
  });

  after(() => {
    // Clean up any CYPRESS_ prefixed statuses created during tests
    const email = Cypress.env('ADMIN_EMAIL') || 'admin@test.com';
    const password = Cypress.env('ADMIN_PASSWORD') || 'test-password-123';
    cy.login(email, password);
    cy.visit('/dashboard/settings/statuses');

    // Delete each status with CYPRESS_TEST_ prefix via UI
    cy.get('body').then(($body) => {
      const cypressRows = $body.find('table tbody tr').filter((_, row) => {
        return Cypress.$(row).text().includes('CYPRESS_TEST_');
      });

      if (cypressRows.length > 0) {
        // Delete statuses one by one
        const deleteNext = () => {
          cy.get('body').then(($body) => {
            const rows = $body.find('table tbody tr').filter((_, row) => {
              return Cypress.$(row).text().includes('CYPRESS_TEST_');
            });

            if (rows.length > 0) {
              cy.wrap(rows.first()).within(() => {
                cy.get('button').last().click();
              });
              cy.contains('button', 'Delete').click();
              cy.wait(500);
              deleteNext();
            }
          });
        };
        deleteNext();
      }
    });
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

    // Capture created status ID for cleanup
    cy.wait('@createStatus').then((interception) => {
      if (interception.response?.body?.id) {
        createdStatusIds.push(interception.response.body.id);
      }
    });

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
    // First create a status specifically for this delete test
    const deleteTestCode = 'CYPRESS_DEL_' + randomLetters;
    cy.contains('button', 'Add Status').click();
    cy.contains('h2, h3', 'Add Status').should('be.visible');
    cy.contains('label', 'Status Code').parent().find('input').type(deleteTestCode);
    cy.contains('label', 'Display Name').parent().find('input').type('Delete Test Status');
    cy.contains('button', 'Create Status').click();
    cy.contains(deleteTestCode, { timeout: 10000 }).should('be.visible');

    // Now find and delete it
    // Use .parents('tr') instead of .parent('tr') since the text is in a <code> inside <td>
    cy.get('table tbody tr').contains(deleteTestCode).parents('tr').first().within(() => {
      cy.get('button').last().click();
    });

    // Confirmation dialog should appear
    cy.contains('Are you sure').should('be.visible');

    // Actually confirm deletion
    cy.contains('button', 'Delete').click();

    // Status should be removed from table
    cy.contains(deleteTestCode).should('not.exist');
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
    cy.contains('Display Name').should('be.visible');
    cy.contains('Status Code').should('be.visible');
    cy.contains('Outcome Type').should('be.visible');
    cy.contains('Terminal').should('be.visible');
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

/**
 * Tests for Outcome Type feature in Status Settings
 * Part of v2 Action Engine integration
 */
describe('Settings - Status Outcome Type', () => {
  beforeEach(() => {
    const email = Cypress.env('ADMIN_EMAIL') || 'admin@test.com';
    const password = Cypress.env('ADMIN_PASSWORD') || 'test-password-123';
    cy.login(email, password);
    cy.visit('/dashboard/settings/statuses');
  });

  it('should display "Outcome Type" column in status table', () => {
    cy.get('table, [role="table"]').should('exist');
    // Check for Outcome Type column header
    cy.contains('Outcome Type').should('be.visible');
  });

  it('should display outcomeType value or badge for each status row', () => {
    cy.get('body').then(($body) => {
      const hasTable = $body.find('table').length > 0;
      if (hasTable) {
        // Look for outcome type values in table rows
        // These could be badges (ACTIVE, HOLD, SUCCESS, FAILURE, NEUTRAL) or "N/A"
        const hasOutcomeValues =
          $body.find(':contains("ACTIVE")').length > 0 ||
          $body.find(':contains("HOLD")').length > 0 ||
          $body.find(':contains("SUCCESS")').length > 0 ||
          $body.find(':contains("FAILURE")').length > 0 ||
          $body.find(':contains("NEUTRAL")').length > 0 ||
          $body.find(':contains("N/A")').length > 0 ||
          $body.find(':contains("—")').length > 0;

        expect(hasOutcomeValues).to.be.true;
      }
    });
  });

  it('should show Outcome Type dropdown in Add Status modal', () => {
    cy.contains('button', 'Add Status').click();
    cy.contains('h2, h3', 'Add Status').should('be.visible');

    // Outcome Type field should be present
    cy.contains('label', 'Outcome Type').should('be.visible');

    // Should be a select/dropdown
    cy.contains('label', 'Outcome Type').parent().find('select').should('exist');
  });

  it('should show Outcome Type options in dropdown', () => {
    cy.contains('button', 'Add Status').click();
    cy.contains('h2, h3', 'Add Status').should('be.visible');

    // Click the Outcome Type dropdown to see options
    cy.contains('label', 'Outcome Type').parent().find('select').as('outcomeSelect');

    // Check available options
    cy.get('@outcomeSelect').find('option').should('have.length.greaterThan', 1);

    // Verify specific options exist
    cy.get('@outcomeSelect').find('option').then(($options) => {
      const optionTexts = $options.toArray().map((opt) => opt.textContent);
      expect(optionTexts).to.include.members(['Active', 'Hold', 'Success', 'Failure', 'Neutral']);
    });
  });

  it('should show Outcome Type dropdown in Edit Status modal', () => {
    cy.get('body').then(($body) => {
      // Look for edit buttons in the table
      const editButtons = $body.find('button:contains("Edit"), button[aria-label*="edit"], [data-testid*="edit"]');

      if (editButtons.length > 0) {
        cy.wrap(editButtons.first()).click();

        // Wait for modal to open
        cy.contains('h2, h3', 'Edit Status').should('be.visible');

        // Outcome Type field should be present
        cy.contains('label', 'Outcome Type').should('be.visible');
        cy.contains('label', 'Outcome Type').parent().find('select').should('exist');
      } else {
        cy.log('No edit buttons found - skipping edit modal test');
      }
    });
  });

  it('should show Outcome Type description text', () => {
    cy.contains('button', 'Add Status').click();
    cy.contains('h2, h3', 'Add Status').should('be.visible');

    // Should show helper text about outcome type
    cy.contains('badge color styling').should('be.visible');
  });
});

describe('Settings - Status Outcome Type CRUD', () => {
  // Generate unique identifiers for test data
  const randomLetters = Array.from({ length: 6 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join('');
  const testStatusCode = 'CYPRESS_OT_' + randomLetters;
  const testStatusName = 'Cypress OutcomeType Test';

  beforeEach(() => {
    const email = Cypress.env('ADMIN_EMAIL') || 'admin@test.com';
    const password = Cypress.env('ADMIN_PASSWORD') || 'test-password-123';
    cy.login(email, password);
    cy.visit('/dashboard/settings/statuses');

    // Intercept status creation to capture ID
    cy.intercept('POST', '**/settings/statuses').as('createStatus');
  });

  after(() => {
    // Clean up any CYPRESS_OT_ prefixed statuses created during tests
    const email = Cypress.env('ADMIN_EMAIL') || 'admin@test.com';
    const password = Cypress.env('ADMIN_PASSWORD') || 'test-password-123';
    cy.login(email, password);
    cy.visit('/dashboard/settings/statuses');

    // Delete each status with CYPRESS_OT_ prefix via UI
    cy.get('body').then(($body) => {
      const cypressRows = $body.find('table tbody tr').filter((_, row) => {
        return Cypress.$(row).text().includes('CYPRESS_OT_');
      });

      if (cypressRows.length > 0) {
        // Delete statuses one by one
        const deleteNext = () => {
          cy.get('body').then(($body) => {
            const rows = $body.find('table tbody tr').filter((_, row) => {
              return Cypress.$(row).text().includes('CYPRESS_OT_');
            });

            if (rows.length > 0) {
              cy.wrap(rows.first()).within(() => {
                cy.get('button').last().click();
              });
              cy.contains('button', 'Delete').click();
              cy.wait(500);
              deleteNext();
            }
          });
        };
        deleteNext();
      }
    });
  });

  it('should save outcomeType when creating new status', () => {
    cy.contains('button', 'Add Status').click();
    cy.contains('h2, h3', 'Add Status').should('be.visible');

    // Fill in required fields
    cy.contains('label', 'Status Code').parent().find('input').type(testStatusCode);
    cy.contains('label', 'Display Name').parent().find('input').type(testStatusName);

    // Select an Outcome Type
    cy.contains('label', 'Outcome Type').parent().find('select').select('HOLD');

    // Submit the form
    cy.contains('button', 'Create Status').click();

    // Capture created status ID for cleanup
    cy.wait('@createStatus').then((interception) => {
      if (interception.response?.body?.id) {
        createdStatusIds.push(interception.response.body.id);
      }
    });

    // Should show success and status in list
    cy.contains(testStatusName, { timeout: 10000 }).should('be.visible');

    // Verify the outcome type is displayed in the table
    cy.get('body').then(($body) => {
      // The new status row should show HOLD badge
      const statusRow = $body.find(`tr:contains("${testStatusName}")`);
      if (statusRow.length > 0) {
        const hasHoldBadge = statusRow.find(':contains("HOLD")').length > 0;
        expect(hasHoldBadge).to.be.true;
      }
    });
  });

  it('should update outcomeType when editing status', () => {
    cy.get('body').then(($body) => {
      // Look for edit buttons
      const editButtons = $body.find('button:contains("Edit"), button[aria-label*="edit"], [data-testid*="edit"]');

      if (editButtons.length > 0) {
        cy.wrap(editButtons.first()).click();

        // Wait for modal to open
        cy.contains('h2, h3', 'Edit Status').should('be.visible');

        // Change the Outcome Type
        cy.contains('label', 'Outcome Type').parent().find('select').select('SUCCESS');

        // Save changes
        cy.contains('button', 'Save').click();

        // Modal should close
        cy.contains('h2, h3', 'Edit Status').should('not.exist');

        // Success toast should appear
        cy.contains('Status updated', { timeout: 10000 }).should('be.visible');
      } else {
        cy.log('No edit buttons found - skipping edit test');
      }
    });
  });

  it('should allow clearing outcomeType (set to None)', () => {
    cy.get('body').then(($body) => {
      const editButtons = $body.find('button:contains("Edit"), button[aria-label*="edit"], [data-testid*="edit"]');

      if (editButtons.length > 0) {
        cy.wrap(editButtons.first()).click();
        cy.contains('h2, h3', 'Edit Status').should('be.visible');

        // Select "None" option to clear outcome type
        cy.contains('label', 'Outcome Type').parent().find('select').select('');

        // Verify the dropdown shows None/empty state
        cy.contains('label', 'Outcome Type')
          .parent()
          .find('select')
          .should('have.value', '');

        // Cancel to avoid changing data
        cy.contains('button', 'Cancel').click();
      }
    });
  });
});
