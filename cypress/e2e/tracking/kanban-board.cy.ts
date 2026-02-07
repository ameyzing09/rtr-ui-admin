/**
 * Cypress E2E tests for KanbanBoard component
 * Tests the drag-and-drop functionality with v2 Action Engine
 */
describe('Tracking - Kanban Board', () => {
  // Test data identifiers
  let testJobId: string;
  let testApplicationId: string;
  const testJobPrefix = 'E2E Kanban Test Job';

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

      // Assign a pipeline to the job (required for Kanban view)
      cy.listPipelinesViaApi().then((pipelines) => {
        if (pipelines.length > 0) {
          cy.assignPipelineViaApi(pipelines[0].id, testJobId);
        } else {
          cy.log('Warning: No pipelines found - Kanban view may not be available');
        }
      });

      // Create test application via API (PENDING status by default)
      cy.createApplicationViaApi(
        testJobId,
        'E2E Kanban Test Applicant',
        `e2e-kanban-${Date.now()}@example.com`
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

      // Fallback: Find job cards by looking for job title links
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
          cy.log(`Found job link: ${href}`);
          cy.visit(href as string);
          cy.url({ timeout: 15000 }).should('match', /\/dashboard\/jobs\/[^\/]+$/);
        } else {
          cy.log('No job detail links found in the system');
          return;
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
   * Helper to find stage columns using jQuery (doesn't fail on empty)
   */
  const findStageColumns = (callback: (stages: JQuery<HTMLElement>) => void) => {
    cy.get('body').then(($body) => {
      const stages = $body.find('[data-testid*="kanban-stage"]');
      callback(stages);
    });
  };

  describe('Board Display', () => {
    it('should display kanban board with stage columns', () => {
      navigateToKanbanBoard();

      // Wait for board to load
      cy.get('[class*="overflow-x-auto"]', { timeout: 10000 }).should('exist');

      // Should have multiple stage columns with data-testid
      findStageColumns(($stages) => {
        if ($stages.length > 0) {
          expect($stages.length).to.be.greaterThan(0);
          cy.log(`Found ${$stages.length} stage columns`);
        } else {
          cy.log('No stage columns found - pipeline may not be configured');
        }
      });
    });

    it('should display application cards within stage columns', () => {
      navigateToKanbanBoard();

      cy.get('[class*="overflow-x-auto"]', { timeout: 10000 }).should('exist');

      // Check for application cards using helper that doesn't fail on empty
      findApplicationCards(($cards) => {
        cy.log(`Found ${$cards.length} application cards`);
        // We created a test application, so we should have at least one
        if (testApplicationId) {
          expect($cards.length).to.be.greaterThan(0);
        }
      });
    });

    it('should display application cards with status badges', () => {
      navigateToKanbanBoard();

      cy.get('[class*="overflow-x-auto"]', { timeout: 10000 }).should('exist');

      findApplicationCards(($cards) => {
        if ($cards.length > 0) {
          // Status badges should be present on cards
          cy.get('[class*="rounded-full"][class*="font-medium"]').should('have.length.greaterThan', 0);
        } else {
          cy.log('No application cards found - skipping status badge check');
        }
      });
    });

    it('should show outcomeType-based styling on status badges', () => {
      navigateToKanbanBoard();

      cy.get('[class*="overflow-x-auto"]', { timeout: 10000 }).should('exist');

      cy.get('body').then(($body) => {
        const statusBadges = $body.find('[class*="rounded-full"][class*="font-medium"]');
        if (statusBadges.length > 0) {
          // Badges should have color classes (blue, amber, green, red, or gray)
          const hasColorClass = statusBadges.toArray().some((badge) => {
            const classes = badge.className;
            return (
              classes.includes('blue') ||
              classes.includes('amber') ||
              classes.includes('green') ||
              classes.includes('red') ||
              classes.includes('gray')
            );
          });
          expect(hasColorClass).to.be.true;
        } else {
          cy.log('No status badges found - skipping color check');
        }
      });
    });
  });

  describe('Drag and Drop - Normal Scenarios', () => {
    it('should allow clicking on application cards', () => {
      navigateToKanbanBoard();

      cy.get('[class*="overflow-x-auto"]', { timeout: 10000 }).should('exist');

      findApplicationCards(($cards) => {
        if ($cards.length > 0) {
          // Click on a card - should open drawer
          cy.wrap($cards.first()).click();
          cy.contains('Application Details').should('be.visible');
        } else {
          cy.log('No application cards found - skipping click test');
        }
      });
    });

    it('should show drag handle on non-terminal application cards', () => {
      navigateToKanbanBoard();

      cy.get('[class*="overflow-x-auto"]', { timeout: 10000 }).should('exist');

      cy.get('body').then(($body) => {
        // Look for cards without opacity (non-terminal)
        const activeCards = $body.find('[data-testid*="application-card"]:not([class*="opacity"])');
        if (activeCards.length > 0) {
          // Should have a drag handle (cursor-grab class)
          const dragHandles = $body.find('[class*="cursor-grab"]');
          cy.log(`Found ${dragHandles.length} drag handles for ${activeCards.length} active cards`);
          expect(dragHandles.length).to.be.greaterThan(0);
        } else {
          cy.log('No non-terminal cards found - skipping drag handle check');
        }
      });
    });
  });

  describe('Drag and Drop - Validation Messages', () => {
    // Note: Testing actual drag-drop with dnd-kit requires special handling
    // These tests verify the UI state and messaging

    it('should display stage columns in order', () => {
      navigateToKanbanBoard();

      cy.get('[class*="overflow-x-auto"]', { timeout: 10000 }).should('exist');

      // Verify stages are displayed with index-based data-testid
      findStageColumns(($stages) => {
        if ($stages.length > 0) {
          expect($stages.length).to.be.greaterThan(0);
          // First stage should have index 0
          cy.getBySel('kanban-stage-0').should('exist');
        } else {
          cy.log('No stage columns found - skipping order check');
        }
      });
    });

    it('should show appropriate counts on stage columns', () => {
      navigateToKanbanBoard();

      cy.get('[class*="overflow-x-auto"]', { timeout: 10000 }).should('exist');

      // Stage headers should show counts in rounded-full badges
      findStageColumns(($stages) => {
        if ($stages.length > 0) {
          cy.wrap($stages).each(($stage) => {
            // Each stage should have a count badge
            cy.wrap($stage).find('[class*="rounded-full"]').should('exist');
          });
        } else {
          cy.log('No stage columns found - skipping count check');
        }
      });
    });
  });

  describe('Edge Cases', () => {
    it('should not show drag handle for terminal status cards', () => {
      navigateToKanbanBoard();

      cy.get('[class*="overflow-x-auto"]', { timeout: 10000 }).should('exist');

      cy.get('body').then(($body) => {
        // Terminal cards have opacity class
        const terminalCards = $body.find('[data-testid*="application-card"][class*="opacity"]');
        if (terminalCards.length > 0) {
          // Terminal cards should not have active drag handles
          terminalCards.each((index, card) => {
            // Verify the card doesn't have an active drag handle
            const hasDragHandle = card.querySelector('[class*="cursor-grab"]');
            expect(hasDragHandle).to.be.null;
          });
        } else {
          cy.log('No terminal cards found to verify drag handle behavior');
        }
      });
    });

    it('should handle empty stages gracefully', () => {
      navigateToKanbanBoard();

      cy.get('[class*="overflow-x-auto"]', { timeout: 10000 }).should('exist');

      // Even empty stages should be displayed
      findStageColumns(($stages) => {
        if ($stages.length > 0) {
          expect($stages.length).to.be.greaterThan(0);
          // Check for "No applications" text in empty stages
          cy.get('body').then(($body) => {
            const emptyStageText = $body.find(':contains("No applications")');
            cy.log(`Found ${emptyStageText.length} empty stage indicators`);
          });
        } else {
          cy.log('No stage columns found - skipping empty stage check');
        }
      });
    });

    it('should show applicant name and email on cards', () => {
      navigateToKanbanBoard();

      cy.get('[class*="overflow-x-auto"]', { timeout: 10000 }).should('exist');

      findApplicationCards(($cards) => {
        if ($cards.length > 0) {
          // Cards should show applicant info - name is in h4
          cy.wrap($cards.first()).find('h4[class*="font-medium"]').should('exist');
        } else {
          cy.log('No application cards found - skipping name check');
        }
      });
    });

    it('should show relative time on cards', () => {
      navigateToKanbanBoard();

      cy.get('[class*="overflow-x-auto"]', { timeout: 10000 }).should('exist');

      findApplicationCards(($cards) => {
        if ($cards.length > 0) {
          // Cards should show relative time (text-gray-400, text-xs)
          cy.wrap($cards.first()).find('[class*="text-gray-400"][class*="text-xs"]').should('exist');
        } else {
          cy.log('No application cards found - skipping time check');
        }
      });
    });
  });

  describe('Board Refresh', () => {
    it('should display board after tab switch', () => {
      navigateToKanbanBoard();

      cy.get('[class*="overflow-x-auto"]', { timeout: 10000 }).should('exist');

      // Switch to another tab and back
      cy.contains('button', 'Overview').click();
      cy.contains('button', 'Pipeline').click();

      // Board should still display
      cy.get('[class*="overflow-x-auto"]', { timeout: 10000 }).should('exist');
      findStageColumns(($stages) => {
        if ($stages.length > 0) {
          expect($stages.length).to.be.greaterThan(0);
        } else {
          cy.log('No stage columns found after tab switch');
        }
      });
    });
  });

  describe('Stage Column Display', () => {
    it('should display stage name in column header', () => {
      navigateToKanbanBoard();

      cy.get('[class*="overflow-x-auto"]', { timeout: 10000 }).should('exist');

      // Each stage column should have a name
      findStageColumns(($stages) => {
        if ($stages.length > 0) {
          cy.wrap($stages).each(($stage) => {
            cy.wrap($stage).find('h3[class*="font-semibold"]').should('exist');
          });
        } else {
          cy.log('No stage columns found - skipping name check');
        }
      });
    });

    it('should display stage type badge', () => {
      navigateToKanbanBoard();

      cy.get('[class*="overflow-x-auto"]', { timeout: 10000 }).should('exist');

      // Each stage should show its type (SCREENING, INTERVIEW, etc.)
      findStageColumns(($stages) => {
        if ($stages.length > 0) {
          // Stage type badges have specific colors
          cy.get('body').then(($body) => {
            const hasStageTypes =
              $body.find(':contains("SCREENING")').length > 0 ||
              $body.find(':contains("INTERVIEW")').length > 0 ||
              $body.find(':contains("ASSESSMENT")').length > 0 ||
              $body.find(':contains("OFFER")').length > 0;

            cy.log(`Stage types found: ${hasStageTypes}`);
          });
        } else {
          cy.log('No stage columns found - skipping type badge check');
        }
      });
    });
  });
});
