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

      /**
       * Get auth token from session storage
       * @example cy.getAuthToken().then((token) => { ... })
       */
      getAuthToken(): Chainable<string | null>;

      /**
       * Create a job via the backend API
       * @param title - Job title
       * @example cy.createJobViaApi('Test Job').then((job) => { ... })
       */
      createJobViaApi(title: string): Chainable<{ id: string; title: string }>;

      /**
       * Create an application via the backend API
       * @param jobId - Job ID
       * @param applicantName - Applicant name
       * @param applicantEmail - Applicant email
       * @example cy.createApplicationViaApi('job-id', 'John Doe', 'john@example.com')
       */
      createApplicationViaApi(
        jobId: string,
        applicantName: string,
        applicantEmail: string
      ): Chainable<{ id: string }>;

      /**
       * Submit an application via the public API (no auth required)
       * Returns candidate_access_token for status page access
       * @param jobId - Job ID to apply to
       * @param applicantName - Applicant name
       * @param applicantEmail - Applicant email
       * @example cy.submitPublicApplicationViaApi('job-id', 'Jane Doe', 'jane@example.com')
       */
      submitPublicApplicationViaApi(
        jobId: string,
        applicantName: string,
        applicantEmail: string
      ): Chainable<{ id: string; status: string; candidate_access_token: string }>;

      /**
       * Delete a job via the backend API
       * @param jobId - Job ID to delete
       * @example cy.deleteJobViaApi('job-id')
       */
      deleteJobViaApi(jobId: string): Chainable<Cypress.Response<unknown>>;

      /**
       * List all pipelines via the backend API
       * @example cy.listPipelinesViaApi().then((pipelines) => { ... })
       */
      listPipelinesViaApi(): Chainable<{ id: string; name: string }[]>;

      /**
       * Assign a pipeline to a job via the backend API
       * @param pipelineId - Pipeline ID to assign
       * @param jobId - Job ID to assign the pipeline to
       * @example cy.assignPipelineViaApi('pipeline-id', 'job-id')
       */
      assignPipelineViaApi(pipelineId: string, jobId: string): Chainable<{ message: string }>;
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

/**
 * Get auth token from session storage (set by authClient after login)
 */
Cypress.Commands.add('getAuthToken', () => {
  return cy.window().then((win) => win.sessionStorage.getItem('auth_token'));
});

/**
 * Create a job via the backend API
 */
Cypress.Commands.add('createJobViaApi', (title: string) => {
  const apiBaseUrl = Cypress.env('JOB_API_BASE_URL');
  const tenantId = Cypress.env('TENANT_ID');

  return cy.getAuthToken().then((token) => {
    return cy.request({
      method: 'POST',
      url: `${apiBaseUrl}/job`,
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Tenant-ID': tenantId,
        'Content-Type': 'application/json',
      },
      body: { title, isPublic: true, publishAt: new Date().toISOString(), expireAt: null },
    }).then((response) => {
      // API returns data directly (not wrapped in { data: ... })
      return response.body;
    });
  });
});

/**
 * Create an application via the backend API
 */
Cypress.Commands.add(
  'createApplicationViaApi',
  (jobId: string, applicantName: string, applicantEmail: string) => {
    const apiBaseUrl = Cypress.env('JOB_API_BASE_URL');
    const tenantId = Cypress.env('TENANT_ID');

    return cy.getAuthToken().then((token) => {
      return cy.request({
        method: 'POST',
        url: `${apiBaseUrl}/applications`,
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Tenant-ID': tenantId,
          'Content-Type': 'application/json',
        },
        body: {
          jobId,
          applicantName,
          applicantEmail,
          applicantPhone: '+1-555-0100',
          status: 'PENDING',
        },
      }).then((response) => {
        // API returns data directly (not wrapped in { data: ... })
        return response.body;
      });
    });
  }
);

/**
 * Submit an application via the public API route (no auth required)
 * Uses the Next.js API route which handles tenant resolution internally
 */
Cypress.Commands.add(
  'submitPublicApplicationViaApi',
  (jobId: string, applicantName: string, applicantEmail: string) => {
    return cy.request({
      method: 'POST',
      url: '/api/public/applications',
      body: {
        job_id: jobId,
        applicant_name: applicantName,
        applicant_email: applicantEmail,
        applicant_phone: '+1-555-0100',
        cover_letter: 'E2E test application for status page verification.',
      },
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.candidate_access_token).to.match(
        /^[0-9a-fA-F-]{36}$/
      );
      return response.body;
    });
  }
);

/**
 * Delete a job via the backend API
 */
Cypress.Commands.add('deleteJobViaApi', (jobId: string) => {
  const apiBaseUrl = Cypress.env('JOB_API_BASE_URL');
  const tenantId = Cypress.env('TENANT_ID');

  return cy.getAuthToken().then((token) => {
    return cy.request({
      method: 'DELETE',
      url: `${apiBaseUrl}/job/${jobId}`,
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Tenant-ID': tenantId,
      },
      failOnStatusCode: false, // Don't fail if already deleted
    });
  });
});

/**
 * List all pipelines via the backend API
 * Note: Pipeline API returns PascalCase (ID, Name), we transform to snake_case
 */
Cypress.Commands.add('listPipelinesViaApi', () => {
  const apiBaseUrl = Cypress.env('PIPELINE_API_BASE_URL');
  const tenantId = Cypress.env('TENANT_ID');

  return cy.getAuthToken().then((token) => {
    return cy.request({
      method: 'GET',
      url: `${apiBaseUrl}/pipeline`,
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Tenant-ID': tenantId,
      },
    }).then((response) => {
      // Transform PascalCase response to snake_case for consistency
      const pipelines = response.body.map((p: { ID: string; Name: string }) => ({
        id: p.ID,
        name: p.Name,
      }));
      return pipelines;
    });
  });
});

/**
 * Assign a pipeline to a job via the backend API
 * Note: If pipeline is already assigned, this is treated as success
 */
Cypress.Commands.add('assignPipelineViaApi', (pipelineId: string, jobId: string) => {
  const apiBaseUrl = Cypress.env('PIPELINE_API_BASE_URL');
  const tenantId = Cypress.env('TENANT_ID');

  return cy.getAuthToken().then((token) => {
    return cy.request({
      method: 'POST',
      url: `${apiBaseUrl}/pipeline/assign`,
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Tenant-ID': tenantId,
        'Content-Type': 'application/json',
      },
      body: {
        pipeline_id: pipelineId,
        job_id: jobId,
      },
      failOnStatusCode: false, // Handle "already assigned" case gracefully
    }).then((response) => {
      // Treat "Pipeline already assigned" as success (pipeline is assigned, which is what we want)
      if (response.status === 400 && response.body?.message?.includes('already assigned')) {
        Cypress.log({ name: 'assignPipeline', message: 'Pipeline already assigned - continuing' });
        return { message: 'Pipeline already assigned' };
      }
      // Fail on other errors
      if (response.status >= 400) {
        throw new Error(`Failed to assign pipeline: ${response.body?.message || response.statusText}`);
      }
      return response.body;
    });
  });
});

export {};
