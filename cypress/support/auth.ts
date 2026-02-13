/// <reference types="cypress" />

/**
 * Programmatic login helper — bypasses the UI login form.
 *
 * Sets both the httpOnly cookie (for middleware) and sessionStorage
 * keys (for AuthProvider + fetcher) so the app treats the session
 * as fully authenticated.
 *
 * Uses cy.session() for caching — subsequent calls with the same
 * role reuse the cached session instead of hitting the login API.
 */
export function loginAs(role: 'ADMIN' | 'INTERVIEWER') {
  const email =
    role === 'ADMIN'
      ? Cypress.env('ADMIN_EMAIL')
      : Cypress.env('INTERVIEWER_EMAIL');
  const password =
    role === 'ADMIN'
      ? Cypress.env('ADMIN_PASSWORD')
      : Cypress.env('INTERVIEWER_PASSWORD');

  cy.session(
    [email, role],
    () => {
      const authUrl = Cypress.env('USER_AUTH_API_BASE_URL');

      cy.request('POST', `${authUrl}/login`, { email, password }).then(
        ({ body }) => {
          // Map defensively — accept PascalCase (backend) or camelCase
          const token = body.Token || body.token;
          const expiresAt = body.ExpiresAt || body.expiresAt;
          const rawUser = body.User || body.user;

          const user = {
            id: rawUser.ID || rawUser.id,
            tenantId: rawUser.TenantID || rawUser.tenantId,
            name: rawUser.Name || rawUser.name,
            email: rawUser.Email || rawUser.email,
            role: rawUser.Role || rawUser.role,
            mustChangePassword:
              rawUser.ForcePasswordReset ??
              rawUser.mustChangePassword ??
              false,
            permissions: rawUser.Permissions || rawUser.permissions || [],
          };

          const branding =
            body.TenantBranding || body.PlatformBranding || undefined;

          const session = { token, expiresAt, user, branding };
          const sessionJson = JSON.stringify(session);

          // 1) Set cookie (for middleware)
          cy.setCookie('rtr-admin-session', sessionJson, { path: '/' });

          // 2) Set sessionStorage (for AuthProvider + fetcher)
          cy.visit('/dashboard', {
            onBeforeLoad(win) {
              win.sessionStorage.setItem('rtr-admin-session', sessionJson);
              win.sessionStorage.setItem('auth_token', token);
              win.sessionStorage.setItem('authToken', token);
            },
          });

          cy.url().should('include', '/dashboard');
        }
      );
    },
    {
      validate() {
        cy.visit('/dashboard');
        cy.url().should('include', '/dashboard');
      },
    }
  );
}
