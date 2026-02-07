/**
 * Cypress E2E tests for ApplicationDetailDrawer component
 * Tests the drawer that displays application tracking details
 */
describe('Tracking - Application Detail Drawer', () => {
  beforeEach(() => {
    const email = Cypress.env('ADMIN_EMAIL') || 'admin@test.com';
    const password = Cypress.env('ADMIN_PASSWORD') || 'test-password-123';
    cy.login(email, password);
  });

  /**
   * Navigate to a job with applications and open the kanban view
   */
  const navigateToKanbanBoard = () => {
    cy.visit('/dashboard/jobs');
    // Wait for page to load
    cy.url({ timeout: 10000 }).should('include', '/dashboard/jobs');

    // Wait for job cards to load
    cy.wait(2000);

    // Find job cards by looking for job title links (not create/new actions)
    cy.get('body').then(($body) => {
      const allJobLinks = $body.find('a[href^="/dashboard/jobs/"]');
      const jobDetailLinks = allJobLinks.filter((_, el) => {
        const href = el.getAttribute('href') || '';
        return !href.includes('/create') &&
               !href.includes('/new') &&
               !href.includes('/edit') &&
               href.split('/').length >= 4;
      });

      if (jobDetailLinks.length > 0) {
        const href = jobDetailLinks.first().attr('href');
        cy.log(`Found job link: ${href}`);
        cy.visit(href as string);
        // Wait for job detail page to load
        cy.url({ timeout: 15000 }).should('match', /\/dashboard\/jobs\/[^\/]+$/);
        // Click on Applicants tab (where Kanban board lives)
        cy.contains('button', 'Applicants').click();
        // Wait for Applicants tab to load
        cy.contains('Applicants').should('be.visible');
        // Click on Kanban view mode button if it exists (requires pipeline)
        cy.get('body').then(($pageBody) => {
          const kanbanBtn = $pageBody.find('button:contains("Kanban")');
          if (kanbanBtn.length > 0) {
            cy.wrap(kanbanBtn).click();
            // Wait for kanban board to load
            cy.get('[class*="overflow-x-auto"]', { timeout: 10000 }).should('exist');
          } else {
            cy.log('Kanban view not available - job may not have a pipeline');
          }
        });
      } else {
        cy.log('No job detail links found in the system');
      }
    });
  };

  describe('Drawer Opening and Display', () => {
    it('should open drawer with "Application Details" title when clicking card', () => {
      navigateToKanbanBoard();

      cy.getBySelLike('application-card').then(($cards) => {
        if ($cards.length > 0) {
          cy.wrap($cards.first()).click();
          cy.contains('h2', 'Application Details').should('be.visible');
        } else {
          cy.log('No application cards found - skipping test');
        }
      });
    });

    it('should display applicant name in drawer', () => {
      navigateToKanbanBoard();

      cy.getBySelLike('application-card').then(($cards) => {
        if ($cards.length > 0) {
          cy.wrap($cards.first()).click();
          cy.contains('Application Details').should('be.visible');
          // Applicant name should be displayed prominently
          cy.get('h3[class*="text-xl"]').should('be.visible');
        }
      });
    });

    it('should display applicant email in drawer', () => {
      navigateToKanbanBoard();

      cy.getBySelLike('application-card').then(($cards) => {
        if ($cards.length > 0) {
          cy.wrap($cards.first()).click();
          cy.contains('Application Details').should('be.visible');
          // Email should be visible (with mail icon in gray-500 text)
          cy.get('[class*="text-gray-500"]').should('exist');
        }
      });
    });

    it('should display status badge with outcomeType styling', () => {
      navigateToKanbanBoard();

      cy.getBySelLike('application-card').then(($cards) => {
        if ($cards.length > 0) {
          cy.wrap($cards.first()).click();
          cy.contains('Application Details').should('be.visible');
          // Wait for tracking state to load
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');
          // Status label and badge should be visible (scroll into view for overflow)
          cy.contains('Status').scrollIntoView().should('be.visible');
          // Status badge should have color styling
          cy.get('[class*="rounded-full"][class*="font-medium"]').should('exist');
        }
      });
    });

    it('should display current stage name', () => {
      navigateToKanbanBoard();

      cy.getBySelLike('application-card').then(($cards) => {
        if ($cards.length > 0) {
          cy.wrap($cards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');
          // Current Stage label and value
          cy.contains('Current Stage').should('be.visible');
          // Stage badge should exist with blue styling
          cy.get('[class*="bg-blue-100"][class*="text-blue-800"]').should('exist');
        }
      });
    });
  });

  describe('Action Buttons', () => {
    it('should show "Take Action" button for non-terminal applications', () => {
      navigateToKanbanBoard();

      // Find non-terminal cards (without opacity class)
      cy.get('body').then(($body) => {
        const activeCards = $body.find('[data-testid*="application-card"]:not([class*="opacity"])');
        if (activeCards.length > 0) {
          cy.wrap(activeCards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');
          // Take Action button should be visible and enabled (scroll into view for overflow)
          cy.getBySel('take-action-btn').scrollIntoView().should('be.visible').and('not.be.disabled');
        } else {
          cy.log('No non-terminal application cards found');
        }
      });
    });

    it('should show "History" tab in drawer header', () => {
      navigateToKanbanBoard();

      cy.getBySelLike('application-card').then(($cards) => {
        if ($cards.length > 0) {
          cy.wrap($cards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');
          // History tab should be visible in drawer header
          cy.contains('button', 'History').should('be.visible');
        }
      });
    });

    it('should show history content when clicking "History" tab', () => {
      navigateToKanbanBoard();

      cy.getBySelLike('application-card').then(($cards) => {
        if ($cards.length > 0) {
          cy.wrap($cards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');
          // Click History tab
          cy.contains('button', 'History').click();
          // History content should be visible (timeline with history entries or "No history available")
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');
          // Either shows history entries or empty state
          cy.get('body').then(($body) => {
            const hasHistory = $body.find('[class*="relative pl-10"]').length > 0;
            const hasEmptyState = $body.text().includes('No history available');
            expect(hasHistory || hasEmptyState).to.be.true;
          });
        }
      });
    });

    it('should show link to full application details', () => {
      navigateToKanbanBoard();

      cy.getBySelLike('application-card').then(($cards) => {
        if ($cards.length > 0) {
          cy.wrap($cards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');
          // Link to full application
          cy.contains('View full application details').should('be.visible');
          cy.get('a[href*="/dashboard/applications/"]').should('exist');
        }
      });
    });
  });

  describe('Drawer Closing', () => {
    it('should close drawer on X button click', () => {
      navigateToKanbanBoard();

      cy.getBySelLike('application-card').then(($cards) => {
        if ($cards.length > 0) {
          cy.wrap($cards.first()).click();
          cy.contains('Application Details').should('be.visible');
          // Click the X button (close button in header)
          cy.get('[class*="text-gray-400"][class*="hover:bg-gray-100"]').first().click();
          // Drawer should close
          cy.contains('h2', 'Application Details').should('not.exist');
        }
      });
    });

    it('should close drawer on backdrop click', () => {
      navigateToKanbanBoard();

      cy.getBySelLike('application-card').then(($cards) => {
        if ($cards.length > 0) {
          cy.wrap($cards.first()).click();
          cy.contains('Application Details').should('be.visible');
          // Click on backdrop
          cy.get('[class*="bg-black/50"]').click({ force: true });
          // Drawer should close
          cy.contains('h2', 'Application Details').should('not.exist');
        }
      });
    });
  });

  describe('Terminal Application Edge Cases', () => {
    it('should disable "Take Action" button for terminal applications', () => {
      navigateToKanbanBoard();

      // Find terminal cards (with opacity class)
      cy.get('body').then(($body) => {
        const terminalCards = $body.find('[data-testid*="application-card"][class*="opacity"]');
        if (terminalCards.length > 0) {
          cy.wrap(terminalCards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');
          // Take Action button should be disabled
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

  describe('Loading States', () => {
    it('should show loading state while fetching tracking state', () => {
      navigateToKanbanBoard();

      cy.getBySelLike('application-card').then(($cards) => {
        if ($cards.length > 0) {
          cy.wrap($cards.first()).click();
          cy.contains('Application Details').should('be.visible');
          // Loading spinner appears briefly while fetching
          // The drawer opens immediately, then loads tracking state
          // We verify the drawer opens and eventually shows content
          cy.get('[class*="animate-spin"]', { timeout: 5000 }).should('not.exist');
          // Content should be visible after loading (scroll into view for overflow)
          cy.contains('Status').scrollIntoView().should('be.visible');
        }
      });
    });
  });

  describe('Timestamps', () => {
    it('should display entered stage timestamp', () => {
      navigateToKanbanBoard();

      cy.getBySelLike('application-card').then(($cards) => {
        if ($cards.length > 0) {
          cy.wrap($cards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');
          // Should show entered stage timestamp
          cy.contains('Entered stage').should('be.visible');
        }
      });
    });

    it('should display created timestamp', () => {
      navigateToKanbanBoard();

      cy.getBySelLike('application-card').then(($cards) => {
        if ($cards.length > 0) {
          cy.wrap($cards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');
          // Should show created timestamp
          cy.contains('Created').should('be.visible');
        }
      });
    });
  });

  describe('Actions Section', () => {
    it('should display "Actions" header in drawer', () => {
      navigateToKanbanBoard();

      cy.getBySelLike('application-card').then(($cards) => {
        if ($cards.length > 0) {
          cy.wrap($cards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');
          // Actions header (scroll into view for overflow)
          cy.contains('Actions').scrollIntoView().should('be.visible');
        }
      });
    });

    it('should show action descriptions', () => {
      navigateToKanbanBoard();

      cy.get('body').then(($body) => {
        const activeCards = $body.find('[data-testid*="application-card"]:not([class*="opacity"])');
        if (activeCards.length > 0) {
          cy.wrap(activeCards.first()).click();
          cy.contains('Application Details').should('be.visible');
          cy.get('[class*="animate-spin"]', { timeout: 10000 }).should('not.exist');
          // Take Action should have description for non-terminal apps (scroll into view for overflow)
          cy.contains('Advance, hold, reject, or take other actions').scrollIntoView().should('be.visible');
          // Note: "See all stage transitions" removed - history is now accessed via tab
        }
      });
    });
  });
});
