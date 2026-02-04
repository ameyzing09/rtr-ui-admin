/// <reference types="cypress" />

// ***********************************************
// Custom commands for RTR Admin E2E tests
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login via the UI
       * @param email - User email
       * @param password - User password
       * @param audience - Login audience ('tenant' or 'platform')
       * @example cy.login('admin@test.com', 'password123')
       */
      login(email: string, password: string, audience?: 'tenant' | 'platform'): Chainable<void>;

      /**
       * Custom command to logout and clear session
       * @example cy.logout()
       */
      logout(): Chainable<void>;

      /**
       * Custom command to get elements by data-testid attribute
       * @param selector - The data-testid value
       * @example cy.getBySel('submit-button')
       */
      getBySel(selector: string): Chainable<JQuery<HTMLElement>>;

      /**
       * Custom command to get elements by data-testid that contains a value
       * @param selector - The partial data-testid value
       * @example cy.getBySelLike('job-card')
       */
      getBySelLike(selector: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

/**
 * Login command using cy.session for caching
 */
Cypress.Commands.add('login', (email: string, password: string, audience: 'tenant' | 'platform' = 'tenant') => {
  cy.session(
    [email, audience],
    () => {
      cy.visit('/login');

      // Select the login audience
      if (audience === 'platform') {
        cy.contains('button', 'Platform super admin').click();
      } else {
        cy.contains('button', 'Tenant access').click();
      }

      // Fill in credentials
      cy.get('input[type="email"]').clear().type(email);
      cy.get('input[type="password"]').clear().type(password);

      // Submit the form
      cy.get('button[type="submit"]').contains('Sign in').click();

      // Wait for redirect to dashboard
      cy.url().should('include', '/dashboard');
    },
    {
      validate: () => {
        // Validate that the session is still valid by checking we can access dashboard
        cy.visit('/dashboard');
        cy.url().should('include', '/dashboard');
      },
    }
  );
});

/**
 * Logout command - clears all auth state
 */
Cypress.Commands.add('logout', () => {
  cy.clearCookies();
  cy.clearLocalStorage();
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

/**
 * Get element by data-testid attribute
 */
Cypress.Commands.add('getBySel', (selector: string) => {
  return cy.get(`[data-testid="${selector}"]`);
});

/**
 * Get element by data-testid that contains the selector
 */
Cypress.Commands.add('getBySelLike', (selector: string) => {
  return cy.get(`[data-testid*="${selector}"]`);
});

export {};
