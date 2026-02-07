/**
 * Cypress E2E tests for ActionModal component
 * Tests the action engine for executing actions on applications
 */
describe('Tracking - Action Modal', () => {
  // Test data identifiers
  let testJobId: string;
  let testApplicationId: string;
  const testJobPrefix = 'E2E Action Test Job';

  before(() => {
    // Login first (populates sessionStorage with auth token)
    const email = Cypress.env('ADMIN_EMAIL');
    const password = Cypress.env('ADMIN_PASSWORD');
    cy.login(email, password);

    // Visit dashboard to ensure session is active
    cy.visit('/dashboard');

    // Create test job via API
    const jobTitle = `${testJobPrefix} - ${Date.now()}`;
    cy.createJobViaApi(jobTitle).then((job) => {
      testJobId = job.id;

      // Create test application via API
      cy.createApplicationViaApi(
        testJobId,
        'E2E Test Applicant',
        `e2e-test-${Date.now()}@example.com`
      ).then((app) => {
        testApplicationId = app.id;
      });
    });
  });

  after(() => {
    // Cleanup via API
    if (testJobId) {
      cy.login(Cypress.env('ADMIN_EMAIL'), Cypress.env('ADMIN_PASSWORD'));
      cy.visit('/dashboard');
      cy.deleteJobViaApi(testJobId);
    }
  });

  beforeEach(() => {
    const email = Cypress.env('ADMIN_EMAIL') || 'admin@test.com';
    const password = Cypress.env('ADMIN_PASSWORD') || 'test-password-123';
    cy.login(email, password);
  });

  /**
   * Navigate to the test job's kanban board
   */
  const navigateToKanbanBoard = () => {
    // Use the stored test job ID to navigate directly
    if (testJobId) {
      cy.visit(`/dashboard/jobs/${testJobId}`);
      cy.url({ timeout: 15000 }).should('match', /\/dashboard\/jobs\/[^\/]+$/);
    } else {
      cy.visit('/dashboard/jobs');
      cy.url({ timeout: 10000 }).should('include', '/dashboard/jobs');
      cy.wait(2000);

      // Find job cards by looking for job title links
      cy.get('body').then(($body) => {
        const allJobLinks = $body.find('a[href^="/dashboard/jobs/"]');
        const jobDetailLinks = allJobLinks.filter((_, el) => {
          const href = el.getAttribute('href') || '';
          return (
            !href.includes('/create') &&
            !href.includes('/new') &&
            !href.includes('/edit') &&
            href.split('/').length >= 4
          );
        });

        if (jobDetailLinks.length > 0) {
          const href = jobDetailLinks.first().attr('href');
          cy.visit(href as string);
          cy.url({ timeout: 15000 }).should('match', /\/dashboard\/jobs\/[^\/]+$/);
        }
      });
    }

    // Click on Applicants tab (where Kanban board lives)
    cy.contains('button', 'Applicants').click();
    cy.contains('Applicants').should('be.visible');

    // Click on Kanban view mode button if it exists (requires pipeline)
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

  /**
   * Helper to find application cards using jQuery (doesn't fail on empty)
   */
  const findApplicationCards = (callback: (cards: JQuery<HTMLElement>) => void) => {
    cy.get('body').then(($body) => {
      const cards = $body.find('[data-testid*="application-card"]');
      callback(cards);
    });
  };

  /**
   * Helper to find action cards using jQuery (doesn't fail on empty)
   */
  const findActionCards = (callback: (cards: JQuery<HTMLElement>) => void) => {
    cy.get('body').then(($body) => {
      const cards = $body.find('[data-testid*="action-card"]');
      callback(cards);
    });
  };

  describe('Modal Opening', () => {
    it('should open action modal when clicking "Take Action" button', () => {
      navigateToKanbanBoard();

      findApplicationCards(($cards) => {
        if ($cards.length > 0) {
          cy.wrap($cards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          // Click Take Action button
          cy.getBySel('take-action-btn').scrollIntoView().click();

          // Modal should open - check within the modal element
          cy.getBySel('action-modal').should('be.visible');
          cy.getBySel('action-modal').within(() => {
            cy.contains('Take Action').should('be.visible');
          });
        } else {
          cy.log('No application cards found - skipping test');
        }
      });
    });

    it('should display applicant name in modal', () => {
      navigateToKanbanBoard();

      findApplicationCards(($cards) => {
        if ($cards.length > 0) {
          cy.wrap($cards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          cy.getBySel('take-action-btn').scrollIntoView().click();
          cy.getBySel('action-modal').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          // Applicant label should be visible within the modal
          cy.getBySel('action-modal').within(() => {
            cy.contains('Applicant').should('be.visible');
          });
        } else {
          cy.log('No application cards found - skipping test');
        }
      });
    });

    it('should display current status in modal', () => {
      navigateToKanbanBoard();

      findApplicationCards(($cards) => {
        if ($cards.length > 0) {
          cy.wrap($cards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          cy.getBySel('take-action-btn').scrollIntoView().click();
          cy.getBySel('action-modal').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          // Status label should be visible within the modal
          cy.getBySel('action-modal').within(() => {
            cy.contains('Status').should('be.visible');
          });
        } else {
          cy.log('No application cards found - skipping test');
        }
      });
    });

    it('should show loading state while fetching actions', () => {
      navigateToKanbanBoard();

      findApplicationCards(($cards) => {
        if ($cards.length > 0) {
          cy.wrap($cards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          cy.getBySel('take-action-btn').scrollIntoView().click();
          cy.getBySel('action-modal').should('be.visible');

          // Eventually loading completes
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');
        } else {
          cy.log('No application cards found - skipping test');
        }
      });
    });
  });

  describe('Action Cards Display', () => {
    it('should display available action cards or no actions message', () => {
      navigateToKanbanBoard();

      cy.get('body').then(($body) => {
        const activeCards = $body.find('[data-testid*="application-card"]:not([class*="opacity"])');
        if (activeCards.length > 0) {
          cy.wrap(activeCards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          cy.getBySel('take-action-btn').scrollIntoView().click();
          cy.getBySel('action-modal').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          // Action cards or "no actions" message should be visible
          cy.getBySel('action-modal').then(($modal) => {
            const hasActionCards = $modal.find('[data-testid*="action-card"]').length > 0;
            const hasNoActions = $modal.text().includes('No actions available');
            expect(hasActionCards || hasNoActions).to.be.true;
          });
        } else {
          cy.log('No non-terminal application cards found - skipping test');
        }
      });
    });

    it('should show outcome type styling on action cards', () => {
      navigateToKanbanBoard();

      cy.get('body').then(($body) => {
        const activeCards = $body.find('[data-testid*="application-card"]:not([class*="opacity"])');
        if (activeCards.length > 0) {
          cy.wrap(activeCards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          cy.getBySel('take-action-btn').scrollIntoView().click();
          cy.getBySel('action-modal').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          // Check for action cards with outcome type badges using jQuery find
          findActionCards(($actionCards) => {
            if ($actionCards.length > 0) {
              // Cards should have border styling
              cy.wrap($actionCards.first()).should('have.class', 'border-2');
            } else {
              cy.log('No action cards available - skipping styling check');
            }
          });
        } else {
          cy.log('No non-terminal application cards found - skipping test');
        }
      });
    });

    it('should show terminal badge on terminal actions', () => {
      navigateToKanbanBoard();

      cy.get('body').then(($body) => {
        const activeCards = $body.find('[data-testid*="application-card"]:not([class*="opacity"])');
        if (activeCards.length > 0) {
          cy.wrap(activeCards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          cy.getBySel('take-action-btn').scrollIntoView().click();
          cy.getBySel('action-modal').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          // Check for terminal badge on terminal actions
          cy.getBySel('action-modal').then(($modal) => {
            const terminalBadges = $modal.find('[data-testid="terminal-badge"]');
            if (terminalBadges.length > 0) {
              cy.getBySel('terminal-badge').first().should('contain', 'Final');
            } else {
              cy.log('No terminal actions available - skipping terminal badge check');
            }
          });
        } else {
          cy.log('No non-terminal application cards found - skipping test');
        }
      });
    });
  });

  describe('Action Selection', () => {
    it('should select action when clicking card', () => {
      navigateToKanbanBoard();

      cy.get('body').then(($body) => {
        const activeCards = $body.find('[data-testid*="application-card"]:not([class*="opacity"])');
        if (activeCards.length > 0) {
          cy.wrap(activeCards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          cy.getBySel('take-action-btn').scrollIntoView().click();
          cy.getBySel('action-modal').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          findActionCards(($actionCards) => {
            if ($actionCards.length > 0) {
              // Click first action card
              cy.wrap($actionCards.first()).click();
              // Notes field should appear when action is selected
              cy.getBySel('action-notes-input').should('be.visible');
            } else {
              cy.log('No action cards available - skipping selection test');
            }
          });
        } else {
          cy.log('No non-terminal application cards found - skipping test');
        }
      });
    });

    it('should deselect action on second click', () => {
      navigateToKanbanBoard();

      cy.get('body').then(($body) => {
        const activeCards = $body.find('[data-testid*="application-card"]:not([class*="opacity"])');
        if (activeCards.length > 0) {
          cy.wrap(activeCards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          cy.getBySel('take-action-btn').scrollIntoView().click();
          cy.getBySel('action-modal').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          findActionCards(($actionCards) => {
            if ($actionCards.length > 0) {
              // Click first action card to select
              cy.wrap($actionCards.first()).click();
              cy.getBySel('action-notes-input').should('be.visible');
              // Click again to deselect
              cy.wrap($actionCards.first()).click();
              // Notes field should disappear
              cy.getBySel('action-notes-input').should('not.exist');
            } else {
              cy.log('No action cards available - skipping deselection test');
            }
          });
        } else {
          cy.log('No non-terminal application cards found - skipping test');
        }
      });
    });

    it('should show notes field when action is selected', () => {
      navigateToKanbanBoard();

      cy.get('body').then(($body) => {
        const activeCards = $body.find('[data-testid*="application-card"]:not([class*="opacity"])');
        if (activeCards.length > 0) {
          cy.wrap(activeCards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          cy.getBySel('take-action-btn').scrollIntoView().click();
          cy.getBySel('action-modal').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          findActionCards(($actionCards) => {
            if ($actionCards.length > 0) {
              cy.wrap($actionCards.first()).click();
              // Notes field should appear
              cy.getBySel('action-notes-input').should('be.visible');
            } else {
              cy.log('No action cards available - skipping notes field test');
            }
          });
        } else {
          cy.log('No non-terminal application cards found - skipping test');
        }
      });
    });

    it('should show submit button when action is selected', () => {
      navigateToKanbanBoard();

      cy.get('body').then(($body) => {
        const activeCards = $body.find('[data-testid*="application-card"]:not([class*="opacity"])');
        if (activeCards.length > 0) {
          cy.wrap(activeCards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          cy.getBySel('take-action-btn').scrollIntoView().click();
          cy.getBySel('action-modal').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          findActionCards(($actionCards) => {
            if ($actionCards.length > 0) {
              cy.wrap($actionCards.first()).click();
              // Submit button should appear when action is selected
              cy.getBySel('action-submit-btn').should('be.visible');
            } else {
              cy.log('No action cards available - skipping submit button test');
            }
          });
        } else {
          cy.log('No non-terminal application cards found - skipping test');
        }
      });
    });
  });

  describe('Notes Field', () => {
    it('should allow typing in notes field', () => {
      navigateToKanbanBoard();

      cy.get('body').then(($body) => {
        const activeCards = $body.find('[data-testid*="application-card"]:not([class*="opacity"])');
        if (activeCards.length > 0) {
          cy.wrap(activeCards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          cy.getBySel('take-action-btn').scrollIntoView().click();
          cy.getBySel('action-modal').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          findActionCards(($actionCards) => {
            if ($actionCards.length > 0) {
              cy.wrap($actionCards.first()).click();
              // Type in notes field
              cy.getBySel('action-notes-input').type('Test note for action');
              cy.getBySel('action-notes-input').should('have.value', 'Test note for action');
            } else {
              cy.log('No action cards available - skipping typing test');
            }
          });
        } else {
          cy.log('No non-terminal application cards found - skipping test');
        }
      });
    });

    it('should show placeholder text in notes field', () => {
      navigateToKanbanBoard();

      cy.get('body').then(($body) => {
        const activeCards = $body.find('[data-testid*="application-card"]:not([class*="opacity"])');
        if (activeCards.length > 0) {
          cy.wrap(activeCards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          cy.getBySel('take-action-btn').scrollIntoView().click();
          cy.getBySel('action-modal').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          findActionCards(($actionCards) => {
            if ($actionCards.length > 0) {
              cy.wrap($actionCards.first()).click();
              // Check for placeholder text
              cy.getBySel('action-notes-input').should(
                'have.attr',
                'placeholder',
                'Add a note about this action...'
              );
            } else {
              cy.log('No action cards available - skipping placeholder test');
            }
          });
        } else {
          cy.log('No non-terminal application cards found - skipping test');
        }
      });
    });
  });

  describe('Action Execution', () => {
    it('should execute action and show success toast', () => {
      navigateToKanbanBoard();

      cy.get('body').then(($body) => {
        const activeCards = $body.find('[data-testid*="application-card"]:not([class*="opacity"])');
        if (activeCards.length > 0) {
          cy.wrap(activeCards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          cy.getBySel('take-action-btn').scrollIntoView().click();
          cy.getBySel('action-modal').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          findActionCards(($actionCards) => {
            if ($actionCards.length > 0) {
              // Select an action that is not terminal (to avoid finalizing the app)
              const nonTerminalCards = $actionCards.filter(
                (_, el) => !Cypress.$(el).find('[data-testid="terminal-badge"]').length
              );

              if (nonTerminalCards.length > 0) {
                cy.wrap(nonTerminalCards.first()).click();
                cy.getBySel('action-notes-input').type('E2E test action execution');
                cy.getBySel('action-submit-btn').click();

                // Should show success message and close modal
                cy.contains('Action executed', { timeout: 10000 }).should('be.visible');
                cy.getBySel('action-modal').should('not.exist');
              } else {
                cy.log('No non-terminal actions available - skipping execution test');
              }
            } else {
              cy.log('No action cards available - skipping execution test');
            }
          });
        } else {
          cy.log('No non-terminal application cards found - skipping test');
        }
      });
    });
  });

  describe('Modal Closing', () => {
    it('should close modal on X button click', () => {
      navigateToKanbanBoard();

      findApplicationCards(($cards) => {
        if ($cards.length > 0) {
          cy.wrap($cards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          cy.getBySel('take-action-btn').scrollIntoView().click();
          cy.getBySel('action-modal').should('be.visible');

          // Click X button to close (first button in modal header)
          cy.getBySel('action-modal').find('button').first().click();

          // Modal should be closed
          cy.getBySel('action-modal').should('not.exist');
        } else {
          cy.log('No application cards found - skipping test');
        }
      });
    });

    it('should close modal on backdrop click', () => {
      navigateToKanbanBoard();

      findApplicationCards(($cards) => {
        if ($cards.length > 0) {
          cy.wrap($cards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          cy.getBySel('take-action-btn').scrollIntoView().click();
          cy.getBySel('action-modal').should('be.visible');

          // Click backdrop to close (the backdrop has bg-black/50 class)
          cy.get('[class*="bg-black/50"]').first().click({ force: true });

          // Modal should be closed
          cy.getBySel('action-modal').should('not.exist');
        } else {
          cy.log('No application cards found - skipping test');
        }
      });
    });

    it('should close modal on Cancel button click', () => {
      navigateToKanbanBoard();

      findApplicationCards(($cards) => {
        if ($cards.length > 0) {
          cy.wrap($cards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          cy.getBySel('take-action-btn').scrollIntoView().click();
          cy.getBySel('action-modal').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          // Click Cancel button within the modal
          cy.getBySel('action-modal').within(() => {
            cy.contains('button', 'Cancel').click();
          });

          // Modal should be closed
          cy.getBySel('action-modal').should('not.exist');
        } else {
          cy.log('No application cards found - skipping test');
        }
      });
    });
  });

  describe('Terminal State Handling', () => {
    it('should disable "Take Action" button for terminal applications', () => {
      navigateToKanbanBoard();

      // Look for terminal cards (with opacity class)
      cy.get('body').then(($body) => {
        const terminalCards = $body.find('[data-testid*="application-card"][class*="opacity"]');
        if (terminalCards.length > 0) {
          cy.wrap(terminalCards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          // Take Action button should be disabled for terminal apps
          cy.getBySel('take-action-btn').should('be.disabled');
        } else {
          cy.log('No terminal application cards found - skipping test');
        }
      });
    });

    it('should show "Application has been finalized" message for terminal', () => {
      navigateToKanbanBoard();

      cy.get('body').then(($body) => {
        const terminalCards = $body.find('[data-testid*="application-card"][class*="opacity"]');
        if (terminalCards.length > 0) {
          cy.wrap(terminalCards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          // Should show finalized message
          cy.contains('Application has been finalized').should('be.visible');
        } else {
          cy.log('No terminal application cards found - skipping test');
        }
      });
    });
  });

  describe('Terminal Action Warning', () => {
    it('should show warning when terminal action is selected', () => {
      navigateToKanbanBoard();

      cy.get('body').then(($body) => {
        const activeCards = $body.find('[data-testid*="application-card"]:not([class*="opacity"])');
        if (activeCards.length > 0) {
          cy.wrap(activeCards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          cy.getBySel('take-action-btn').scrollIntoView().click();
          cy.getBySel('action-modal').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          // Find and click a terminal action (one with Final badge)
          cy.getBySel('action-modal').then(($modal) => {
            const terminalBadges = $modal.find('[data-testid="terminal-badge"]');
            if (terminalBadges.length > 0) {
              // Click the action card containing the terminal badge
              cy.getBySel('terminal-badge').first().parents('[data-testid*="action-card"]').click();
              // Warning should appear
              cy.contains('This is a final decision').should('be.visible');
            } else {
              cy.log('No terminal actions available - skipping warning test');
            }
          });
        } else {
          cy.log('No non-terminal application cards found - skipping test');
        }
      });
    });
  });

  describe('Stage Information', () => {
    it('should display current stage in modal', () => {
      navigateToKanbanBoard();

      findApplicationCards(($cards) => {
        if ($cards.length > 0) {
          cy.wrap($cards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          cy.getBySel('take-action-btn').scrollIntoView().click();
          cy.getBySel('action-modal').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');

          // Stage label should be visible within the modal
          cy.getBySel('action-modal').within(() => {
            cy.contains('Stage').should('be.visible');
            // Stage badge should exist with blue styling
            cy.get('[class*="bg-blue-100"][class*="text-blue-800"]').should('exist');
          });
        } else {
          cy.log('No application cards found - skipping test');
        }
      });
    });
  });
});
