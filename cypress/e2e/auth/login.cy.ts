describe('Login Page', () => {
  beforeEach(() => {
    cy.logout();
    cy.visit('/login');
  });

  it('should display the login page with all elements', () => {
    // Check page title
    cy.contains('h1', 'Welcome back').should('be.visible');

    // Check login mode buttons
    cy.contains('button', 'Tenant access').should('be.visible');
    cy.contains('button', 'Platform super admin').should('be.visible');

    // Check form fields
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('input[type="checkbox"]').should('be.visible');

    // Check submit button
    cy.get('button[type="submit"]').contains('Sign in').should('be.visible');

    // Check links
    cy.contains('Back to landing').should('be.visible');
    cy.contains('Forgot password?').should('be.visible');
  });

  it('should switch between tenant and platform admin modes', () => {
    // Default should be tenant mode (check aria-pressed attribute)
    cy.contains('button', 'Tenant access').should('have.attr', 'aria-pressed', 'true');
    cy.contains('button', 'Platform super admin').should('have.attr', 'aria-pressed', 'false');

    // Click platform admin button
    cy.contains('button', 'Platform super admin').click();

    // Platform mode should now be active
    cy.contains('button', 'Tenant access').should('have.attr', 'aria-pressed', 'false');
    cy.contains('button', 'Platform super admin').should('have.attr', 'aria-pressed', 'true');

    // Switch back to tenant
    cy.contains('button', 'Tenant access').click();
    cy.contains('button', 'Tenant access').should('have.attr', 'aria-pressed', 'true');
  });

  it('should toggle the Remember me checkbox', () => {
    // Checkbox should be checked by default
    cy.get('input[type="checkbox"]').should('be.checked');

    // Click to uncheck
    cy.get('input[type="checkbox"]').click();
    cy.get('input[type="checkbox"]').should('not.be.checked');

    // Click to check again
    cy.get('input[type="checkbox"]').click();
    cy.get('input[type="checkbox"]').should('be.checked');
  });

  it('should require email and password fields', () => {
    // Try to submit empty form
    cy.get('button[type="submit"]').click();

    // Check for HTML5 validation on email field
    cy.get('input[type="email"]')
      .invoke('prop', 'validationMessage')
      .should('not.be.empty');
  });

  it('should show error message with invalid credentials', () => {
    // Enter invalid credentials
    cy.get('input[type="email"]').type('invalid@test.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    // Should show error message (the exact message depends on your backend)
    // Wait for the request to complete and error to appear
    cy.contains('Invalid credentials', { timeout: 10000 }).should('be.visible');
  });

  it('should redirect to dashboard on successful login', () => {
    // Use credentials from environment
    const email = Cypress.env('ADMIN_EMAIL') || 'admin@test.com';
    const password = Cypress.env('ADMIN_PASSWORD') || 'test-password-123';

    // Enter valid credentials
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();

    // Should redirect to dashboard
    cy.url({ timeout: 15000 }).should('include', '/dashboard');
    cy.contains('Dashboard').should('be.visible');
  });

  it('should show loading state during login', () => {
    const email = Cypress.env('ADMIN_EMAIL') || 'admin@test.com';
    const password = Cypress.env('ADMIN_PASSWORD') || 'test-password-123';

    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();

    // Button should show loading state (be disabled)
    cy.get('button[type="submit"]').should('be.disabled');
  });
});

describe('Login - Session Persistence', () => {
  it('should maintain session and access dashboard directly', () => {
    // First, login
    const email = Cypress.env('ADMIN_EMAIL') || 'admin@test.com';
    const password = Cypress.env('ADMIN_PASSWORD') || 'test-password-123';

    cy.login(email, password);

    // Should be able to access dashboard directly
    cy.visit('/dashboard');
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard').should('be.visible');
  });
});

describe('Login - Platform Super Admin', () => {
  beforeEach(() => {
    cy.logout();
    cy.visit('/login');
  });

  it('should login as platform super admin', () => {
    const email = Cypress.env('PLATFORM_ADMIN_EMAIL') || 'superadmin@recrutr.in';
    const password = Cypress.env('PLATFORM_ADMIN_PASSWORD') || 'password123';

    // Select platform admin mode
    cy.contains('button', 'Platform super admin').click();
    cy.contains('button', 'Platform super admin').should('have.attr', 'aria-pressed', 'true');

    // Enter credentials
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();

    // Should redirect to dashboard
    cy.url({ timeout: 15000 }).should('include', '/dashboard');
  });
});
