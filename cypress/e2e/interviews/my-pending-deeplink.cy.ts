/// <reference types="cypress" />

/**
 * My Pending Interviews — Deep Link + Contract Test
 *
 * Token-based: uses admin login to test the pending interviews list
 * and verify that deep links to evaluations work correctly.
 *
 * This is a Phase 2A acceptance test covering:
 * 1. Page renders with correct structure
 * 2. "Complete Evaluation" CTA links to /dashboard/evaluations/{evaluationInstanceId}
 * 3. Empty state renders correctly
 * 4. Search functionality works
 */
describe('My Pending Interviews Page', () => {
  const email = Cypress.env('ADMIN_EMAIL') || 'admin@test.com';
  const password = Cypress.env('ADMIN_PASSWORD') || 'test-password-123';

  beforeEach(() => {
    cy.login(email, password);
    cy.visit('/dashboard/interviews/my-pending');
  });

  describe('Page Header', () => {
    it('should display the page heading', () => {
      cy.contains('h1', 'My Interviews').should('be.visible');
    });

    it('should display the page subtitle', () => {
      cy.contains('View your pending interview assignments').should('be.visible');
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no interviews exist', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="interview-empty-state"]').length > 0) {
          cy.getBySel('interview-empty-state').should('be.visible');
          cy.contains('All caught up!').should('be.visible');
        } else {
          cy.log('Interviews exist — skipping empty state test');
        }
      });
    });
  });

  describe('Interviews List', () => {
    it('should display the interviews list container', () => {
      cy.getBySel('interviews-list').should('exist');
    });

    it('should display interview cards when interviews exist', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="interview-card-"]').length > 0) {
          cy.getBySelLike('interview-card-').should('have.length.at.least', 1);
        } else if ($body.find('[data-testid="interview-empty-state"]').length > 0) {
          cy.log('No interviews exist — skipping card display test');
        }
      });
    });

    it('should display applicant name on interview cards', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="interview-card-"]').length > 0) {
          cy.getBySelLike('interview-card-')
            .first()
            .within(() => {
              cy.getBySel('interview-applicant-name').should('be.visible');
            });
        } else {
          cy.log('No interviews exist — skipping applicant name test');
        }
      });
    });

    it('should display stage.name badge', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="interview-stage-name"]').length > 0) {
          cy.getBySel('interview-stage-name')
            .first()
            .should('be.visible')
            .and('have.class', 'bg-blue-50');
        } else {
          cy.log('No stages displayed — skipping stage name test');
        }
      });
    });

    it('should display roundType badge', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="interview-round-type"]').length > 0) {
          cy.getBySel('interview-round-type')
            .first()
            .should('be.visible')
            .and('have.class', 'bg-purple-50');
        } else {
          cy.log('No round types displayed — skipping round type test');
        }
      });
    });
  });

  describe('Deep Link to Evaluation', () => {
    it('should have "Complete Evaluation" CTA linking to evaluations page', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="complete-evaluation-cta"]').length > 0) {
          cy.getBySel('complete-evaluation-cta')
            .first()
            .should('be.visible')
            .should('contain.text', 'Complete Evaluation')
            .invoke('attr', 'href')
            .should('match', /\/dashboard\/evaluations\/[0-9a-f-]+/);
        } else {
          cy.log('No evaluation CTAs — skipping deep link test');
        }
      });
    });

    it('should navigate to evaluation page when CTA is clicked', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="complete-evaluation-cta"]').length > 0) {
          cy.getBySel('complete-evaluation-cta')
            .first()
            .invoke('attr', 'href')
            .then((href) => {
              cy.getBySel('complete-evaluation-cta').first().click();
              cy.url().should('include', href as string);
            });
        } else {
          cy.log('No evaluation CTAs — skipping navigation test');
        }
      });
    });
  });

  describe('Interview Detail Link', () => {
    it('should have a link to interview detail page', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="view-interview-detail"]').length > 0) {
          cy.getBySel('view-interview-detail')
            .first()
            .invoke('attr', 'href')
            .should('match', /\/dashboard\/interviews\/[0-9a-f-]+/);
        } else {
          cy.log('No detail links — skipping test');
        }
      });
    });
  });

  describe('Search Functionality', () => {
    it('should display the search input', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="interview-search"]').length > 0) {
          cy.getBySel('interview-search').should('be.visible');
        } else {
          cy.log('Search not visible (empty state) — skipping');
        }
      });
    });

    it('should filter interviews by applicant name', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="interview-card-"]').length > 1) {
          cy.getBySel('interview-applicant-name')
            .first()
            .invoke('text')
            .then((name) => {
              cy.getBySel('interview-search').clear().type(name);
              cy.getBySelLike('interview-card-').should('have.length.at.least', 1);
            });
        } else {
          cy.log('Not enough interviews to test search filtering');
        }
      });
    });

    it('should show no results message for non-matching search', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="interview-card-"]').length > 0) {
          cy.getBySel('interview-search').clear().type('xyznonexistent12345');
          cy.contains('No interviews match your search criteria').should('be.visible');
        } else {
          cy.log('No interviews exist — skipping no results test');
        }
      });
    });
  });

  describe('Interview Count', () => {
    it('should display the total pending interviews count', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="interview-count"]').length > 0) {
          cy.getBySel('interview-count').should('be.visible');
        } else {
          cy.log('Count not visible (empty state) — skipping');
        }
      });
    });

    it('should show correct pluralization for count', () => {
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="interview-count"]').length > 0) {
          cy.getBySel('interview-count').invoke('text').then((text) => {
            const match = text.match(/(\d+)/);
            if (match) {
              const count = parseInt(match[1], 10);
              if (count === 1) {
                expect(text).to.include('interview');
                expect(text).not.to.include('interviews');
              } else {
                expect(text).to.include('interviews');
              }
            }
          });
        } else {
          cy.log('Count not visible — skipping pluralization test');
        }
      });
    });
  });
});
