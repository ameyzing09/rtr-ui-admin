// ***********************************************************
// This file is processed and loaded automatically before your test files.
//
// This is a great place to put global configuration and behavior
// that modifies Cypress.
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import './auth';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global before hook - runs before each test file
beforeEach(() => {
  // Clear cookies and localStorage before each test for isolation
  // Note: Use cy.session() in login command to preserve auth state
});

// Global after hook - runs after each test file
afterEach(() => {
  // Any global cleanup can go here
});

// Prevent Cypress from failing on uncaught exceptions from the app
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent Cypress from failing the test
  // This is useful for third-party library errors we can't control
  console.error('Uncaught exception:', err.message);
  return false;
});
