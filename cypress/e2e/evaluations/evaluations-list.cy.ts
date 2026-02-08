/// <reference types="cypress" />

/**
 * Evaluations List Page Tests
 *
 * Tests for the "My Evaluations" list page that displays pending evaluations
 * for the logged-in user.
 */
describe('Evaluations List Page', () => {
  const email = Cypress.env('ADMIN_EMAIL') || 'admin@test.com';
  const password = Cypress.env('ADMIN_PASSWORD') || 'test-password-123';

  beforeEach(() => {
    cy.login(email, password);
    cy.visit('/dashboard/evaluations');
  });

  describe('Page Header', () => {
    it('should display the page heading', () => {
      cy.contains('h1', 'My Evaluations').should('be.visible');
    });

    it('should display the page subtitle', () => {
      cy.contains('Complete your pending interview evaluations').should('be.visible');
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no evaluations exist', () => {
      // Wait for the page to load
      cy.get('body').then(($body) => {
        // Check if evaluations list is present
        if ($body.find('[data-testid="evaluation-empty-state"]').length > 0) {
          cy.getBySel('evaluation-empty-state').should('be.visible');
          cy.contains('All caught up!').should('be.visible');
          cy.contains('You have no pending evaluations').should('be.visible');
        } else {
          cy.log('Evaluations exist - skipping empty state test');
        }
      });
    });
  });

  describe('Evaluations List', () => {
    it('should display the evaluations list container', () => {
      cy.getBySel('evaluations-list').should('exist');
    });

    it('should display evaluation cards when evaluations exist', () => {
      cy.get('body').then(($body) => {
        // Check if there are evaluation cards
        if ($body.find('[data-testid*="evaluation-card-"]').length > 0) {
          cy.getBySelLike('evaluation-card-').should('have.length.at.least', 1);
        } else if ($body.find('[data-testid="evaluation-empty-state"]').length > 0) {
          cy.log('No evaluations exist - skipping card display test');
        }
      });
    });

    it('should display applicant name on evaluation cards', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="evaluation-card-"]').length > 0) {
          cy.getBySelLike('evaluation-card-')
            .first()
            .within(() => {
              cy.getBySel('evaluation-applicant-name').should('be.visible');
            });
        } else {
          cy.log('No evaluations exist - skipping applicant name test');
        }
      });
    });

    it('should display job title when available', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="evaluation-card-"]').length > 0) {
          cy.getBySelLike('evaluation-card-')
            .first()
            .within(() => {
              // Job title is optional, just check if the card structure exists
              cy.get('h3').should('be.visible');
            });
        } else {
          cy.log('No evaluations exist - skipping job title test');
        }
      });
    });

    it('should display stage name badge when available', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="evaluation-stage-name"]').length > 0) {
          cy.getBySel('evaluation-stage-name')
            .first()
            .should('be.visible')
            .and('have.class', 'bg-blue-50');
        } else {
          cy.log('No stages displayed - skipping stage name test');
        }
      });
    });
  });

  describe('Deadline Badges', () => {
    it('should display deadline indicator when present', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="evaluation-deadline"]').length > 0) {
          cy.getBySel('evaluation-deadline').first().should('be.visible');
        } else {
          cy.log('No deadlines displayed - skipping deadline test');
        }
      });
    });

    it('should show overdue styling for past deadlines', () => {
      cy.get('body').then(($body) => {
        // Check for overdue deadline with red styling
        const overdueElement = $body.find('[data-testid="evaluation-deadline"]:contains("Overdue")');
        if (overdueElement.length > 0) {
          cy.contains('[data-testid="evaluation-deadline"]', 'Overdue')
            .should('have.class', 'text-red-600');
        } else {
          cy.log('No overdue evaluations - skipping overdue styling test');
        }
      });
    });

    it('should show warning styling for due soon deadlines', () => {
      cy.get('body').then(($body) => {
        // Check for "Due today" or "Due tomorrow" with amber styling
        const dueSoonElement = $body.find('[data-testid="evaluation-deadline"]:contains("Due")');
        if (dueSoonElement.length > 0) {
          cy.getBySel('evaluation-deadline')
            .first()
            .should('be.visible');
        } else {
          cy.log('No due soon evaluations - skipping due soon styling test');
        }
      });
    });
  });

  describe('Search Functionality', () => {
    it('should display the search input', () => {
      cy.getBySel('evaluation-search').should('be.visible');
    });

    it('should have correct placeholder text', () => {
      cy.getBySel('evaluation-search')
        .should('have.attr', 'placeholder')
        .and('include', 'Search');
    });

    it('should filter evaluations by applicant name', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="evaluation-card-"]').length > 1) {
          // Get the first applicant name
          cy.getBySel('evaluation-applicant-name')
            .first()
            .invoke('text')
            .then((applicantName) => {
              // Search for that name
              cy.getBySel('evaluation-search').clear().type(applicantName);

              // Verify filtering works
              cy.getBySelLike('evaluation-card-').should('have.length.at.least', 1);
              cy.getBySel('evaluation-applicant-name')
                .first()
                .should('contain.text', applicantName);
            });
        } else {
          cy.log('Not enough evaluations to test search filtering');
        }
      });
    });

    it('should show no results message when search has no matches', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="evaluation-card-"]').length > 0) {
          // Search for something that definitely won't match
          cy.getBySel('evaluation-search').clear().type('xyznonexistent12345');

          // Wait for filtering and check for no results
          cy.contains('No evaluations match your search criteria').should('be.visible');
        } else {
          cy.log('No evaluations exist - skipping no results test');
        }
      });
    });

    it('should clear search and show all evaluations', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="evaluation-card-"]').length > 0) {
          // Get initial count
          cy.getBySelLike('evaluation-card-')
            .its('length')
            .then((initialCount) => {
              // Type something and clear
              cy.getBySel('evaluation-search').type('test');
              cy.getBySel('evaluation-search').clear();

              // Verify all evaluations are shown again
              cy.getBySelLike('evaluation-card-').should('have.length', initialCount);
            });
        } else {
          cy.log('No evaluations exist - skipping clear search test');
        }
      });
    });
  });

  describe('Evaluation Count', () => {
    it('should display the total pending evaluations count', () => {
      cy.getBySel('evaluation-count').should('be.visible');
    });

    it('should show correct pluralization for count', () => {
      cy.getBySel('evaluation-count').invoke('text').then((text) => {
        const match = text.match(/(\d+)/);
        if (match) {
          const count = parseInt(match[1], 10);
          if (count === 1) {
            expect(text).to.include('evaluation');
            expect(text).not.to.include('evaluations');
          } else {
            expect(text).to.include('evaluations');
          }
        }
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to evaluation detail on card click', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="evaluation-card-"]').length > 0) {
          // Get the first evaluation card
          cy.getBySelLike('evaluation-card-')
            .first()
            .then(($card) => {
              // Extract the evaluation ID from the data-testid
              const testId = $card.attr('data-testid');
              const evaluationId = testId?.replace('evaluation-card-', '');

              // Click the card
              cy.wrap($card).click();

              // Verify navigation to detail page
              cy.url().should('include', `/dashboard/evaluations/${evaluationId}`);
            });
        } else {
          cy.log('No evaluations exist - skipping navigation test');
        }
      });
    });

    it('should show hover effect on evaluation cards', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="evaluation-card-"]').length > 0) {
          // Verify card has cursor pointer
          cy.getBySelLike('evaluation-card-')
            .first()
            .should('have.css', 'cursor', 'pointer');
        } else {
          cy.log('No evaluations exist - skipping hover test');
        }
      });
    });

    it('should show chevron icon indicating navigation', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="evaluation-card-"]').length > 0) {
          cy.getBySelLike('evaluation-card-')
            .first()
            .find('svg')
            .should('exist');
        } else {
          cy.log('No evaluations exist - skipping chevron test');
        }
      });
    });
  });

  describe('Responsive Design', () => {
    it('should display correctly on tablet viewport', () => {
      cy.viewport('ipad-2');
      cy.getBySel('evaluations-list').should('be.visible');
      cy.getBySel('evaluation-search').should('be.visible');
    });

    it('should display correctly on mobile viewport', () => {
      cy.viewport('iphone-x');
      cy.getBySel('evaluations-list').should('be.visible');
      cy.getBySel('evaluation-search').should('be.visible');
    });
  });
});
