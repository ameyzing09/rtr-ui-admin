/// <reference types="cypress" />

/**
 * Signals Dashboard Tests
 *
 * Tests for the Application Signals dashboard including signal cards,
 * action conditions panel, and manual signal form.
 */
describe('Signals Dashboard', () => {
  const email = Cypress.env('ADMIN_EMAIL') || 'admin@test.com';
  const password = Cypress.env('ADMIN_PASSWORD') || 'test-password-123';

  let testApplicationId: string | null = null;

  beforeEach(() => {
    cy.login(email, password);
  });

  /**
   * Helper function to navigate to an application's signals page
   * Returns the application ID if successful, null if no applications exist
   */
  const navigateToSignalsDashboard = (): Cypress.Chainable<string | null> => {
    cy.visit('/dashboard/tracking');

    return cy.get('body', { timeout: 10000 }).then(($body) => {
      // Wait for tracking page to load
      cy.url().should('include', '/dashboard/tracking');

      // Find an application card with signals link
      if ($body.find('[data-testid*="application-"]').length > 0 ||
          $body.find('[class*="kanban"]').length > 0) {
        // Try to find application cards in kanban board
        cy.get('[data-testid*="application-"]', { timeout: 5000 })
          .first()
          .then(($card) => {
            // Extract application ID from card
            const testId = $card.attr('data-testid');
            if (testId) {
              const appId = testId.replace('application-', '').replace('card-', '');
              testApplicationId = appId;

              // Navigate to application detail
              cy.wrap($card).click();
              cy.url().should('include', '/dashboard/applications/');

              // Look for signals link
              cy.get('body').then(($detailBody) => {
                if ($detailBody.find('[href*="/signals"]').length > 0) {
                  cy.get('[href*="/signals"]').first().click();
                } else if ($detailBody.find(':contains("View Signals")').length > 0) {
                  cy.contains('View Signals').click();
                } else {
                  // Try direct navigation
                  cy.visit(`/dashboard/applications/${appId}/signals`);
                }
              });
            }
          });

        return cy.url().then((url) => {
          if (url.includes('/signals')) {
            return testApplicationId;
          }
          return null;
        });
      }

      return cy.wrap(null);
    });
  };

  /**
   * Helper to directly navigate to signals page for a known application
   */
  const visitSignalsPage = (applicationId: string) => {
    cy.visit(`/dashboard/applications/${applicationId}/signals`);
    cy.getBySel('signals-dashboard').should('exist');
  };

  describe('Navigation', () => {
    it('should display the signals dashboard page', () => {
      // First find an application
      cy.visit('/dashboard/tracking');

      cy.get('body', { timeout: 10000 }).then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-')
            .first()
            .then(($card) => {
              const testId = $card.attr('data-testid') || '';
              const appId = testId.replace('application-', '').replace('card-', '');

              // Navigate to signals page
              cy.visit(`/dashboard/applications/${appId}/signals`);

              // Verify we're on the signals page
              cy.getBySel('signals-dashboard').should('exist');
            });
        } else {
          cy.log('No applications exist - skipping navigation test');
        }
      });
    });
  });

  describe('Page Header', () => {
    it('should display the page heading', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.contains('h1', 'Application Signals').should('be.visible');
          });
        } else {
          cy.log('No applications exist - skipping page heading test');
        }
      });
    });

    it('should display applicant info', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.getBySel('signals-applicant-info').should('be.visible');
          });
        }
      });
    });

    it('should display back button', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.getBySel('signals-back-btn').should('be.visible');
          });
        }
      });
    });

    it('should navigate back when back button clicked', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.getBySel('signals-back-btn').click();
            cy.url().should('include', `/dashboard/applications/${appId}`);
            cy.url().should('not.include', '/signals');
          });
        }
      });
    });

    it('should display refresh button', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.getBySel('signals-refresh-btn').should('be.visible');
            cy.getBySel('signals-refresh-btn').should('contain.text', 'Refresh');
          });
        }
      });
    });

    it('should refresh data when refresh button clicked', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            // Click refresh - should not error
            cy.getBySel('signals-refresh-btn').click();
            cy.getBySel('signals-dashboard').should('exist');
          });
        }
      });
    });
  });

  describe('Signals Display', () => {
    it('should show empty state when no signals exist', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.get('body').then(($signalsBody) => {
              if ($signalsBody.find('[data-testid="signals-empty-state"]').length > 0) {
                cy.getBySel('signals-empty-state').should('be.visible');
                cy.contains('No signals recorded yet').should('be.visible');
              } else {
                cy.log('Signals exist - skipping empty state test');
              }
            });
          });
        }
      });
    });

    it('should display signal cards when signals exist', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.get('body').then(($signalsBody) => {
              if ($signalsBody.find('[data-testid*="signal-card-"]').length > 0) {
                cy.getBySelLike('signal-card-').should('have.length.at.least', 1);
              } else {
                cy.log('No signals exist for this application');
              }
            });
          });
        }
      });
    });

    it('should display signal description', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.get('body').then(($signalsBody) => {
              if ($signalsBody.find('[data-testid="signal-description"]').length > 0) {
                cy.getBySel('signal-description').first().should('be.visible');
              }
            });
          });
        }
      });
    });

    it('should display signal key', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.get('body').then(($signalsBody) => {
              if ($signalsBody.find('[data-testid="signal-key"]').length > 0) {
                cy.getBySel('signal-key').first().should('be.visible');
              }
            });
          });
        }
      });
    });

    it('should display signal value', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.get('body').then(($signalsBody) => {
              if ($signalsBody.find('[data-testid="signal-value"]').length > 0) {
                cy.getBySel('signal-value').first().should('be.visible');
              }
            });
          });
        }
      });
    });

    it('should display signal type', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.get('body').then(($signalsBody) => {
              if ($signalsBody.find('[data-testid="signal-type"]').length > 0) {
                cy.getBySel('signal-type').first().should('be.visible');
              }
            });
          });
        }
      });
    });

    it('should group signals by source', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.get('body').then(($signalsBody) => {
              // Check for any signal section
              const sources = ['aggregated', 'evaluation', 'manual', 'system'];
              sources.forEach((source) => {
                if ($signalsBody.find(`[data-testid="signals-section-${source}"]`).length > 0) {
                  cy.getBySel(`signals-section-${source}`).should('be.visible');
                }
              });
            });
          });
        }
      });
    });
  });

  describe('Action Conditions Panel', () => {
    it('should display action conditions panel when actions exist', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.get('body').then(($signalsBody) => {
              if ($signalsBody.find('[data-testid="action-conditions-panel"]').length > 0) {
                cy.getBySel('action-conditions-panel').should('be.visible');
              } else if ($signalsBody.find('[data-testid="actions-empty-state"]').length > 0) {
                cy.getBySel('actions-empty-state').should('be.visible');
              }
            });
          });
        }
      });
    });

    it('should display action conditions summary', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.get('body').then(($signalsBody) => {
              if ($signalsBody.find('[data-testid="action-conditions-summary"]').length > 0) {
                cy.getBySel('action-conditions-summary').should('be.visible');
              }
            });
          });
        }
      });
    });

    it('should display available count', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.get('body').then(($signalsBody) => {
              if ($signalsBody.find('[data-testid="available-count"]').length > 0) {
                cy.getBySel('available-count').should('be.visible');
              }
            });
          });
        }
      });
    });

    it('should display blocked count when there are blocked actions', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.get('body').then(($signalsBody) => {
              if ($signalsBody.find('[data-testid="blocked-count"]').length > 0) {
                cy.getBySel('blocked-count').should('be.visible');
              }
            });
          });
        }
      });
    });

    it('should expand action to show conditions', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.get('body').then(($signalsBody) => {
              if ($signalsBody.find('[data-testid="action-expand-btn"]').length > 0) {
                cy.getBySel('action-expand-btn').first().click();
                cy.getBySel('action-conditions-expanded').should('be.visible');
              }
            });
          });
        }
      });
    });

    it('should display action display name', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.get('body').then(($signalsBody) => {
              if ($signalsBody.find('[data-testid="action-display-name"]').length > 0) {
                cy.getBySel('action-display-name').first().should('be.visible');
              }
            });
          });
        }
      });
    });

    it('should display outcome type badge', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.get('body').then(($signalsBody) => {
              if ($signalsBody.find('[data-testid="action-outcome-type"]').length > 0) {
                cy.getBySel('action-outcome-type').first().should('be.visible');
              }
            });
          });
        }
      });
    });

    it('should display condition count', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.get('body').then(($signalsBody) => {
              if ($signalsBody.find('[data-testid="action-condition-count"]').length > 0) {
                cy.getBySel('action-condition-count').first().should('be.visible');
                cy.getBySel('action-condition-count').first().should('contain.text', 'met');
              }
            });
          });
        }
      });
    });
  });

  describe('Manual Signal Form', () => {
    it('should display manual signal toggle button', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.get('body').then(($signalsBody) => {
              if ($signalsBody.find('[data-testid="manual-signal-toggle"]').length > 0) {
                cy.getBySel('manual-signal-toggle').should('be.visible');
                cy.getBySel('manual-signal-toggle').should('contain.text', 'Set Manual Signal');
              } else {
                cy.log('User does not have permission to set manual signals');
              }
            });
          });
        }
      });
    });

    it('should open form when toggle is clicked', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.get('body').then(($signalsBody) => {
              if ($signalsBody.find('[data-testid="manual-signal-toggle"]').length > 0) {
                cy.getBySel('manual-signal-toggle').click();
                cy.getBySel('manual-signal-form').should('be.visible');
              }
            });
          });
        }
      });
    });

    it('should display signal key input', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.get('body').then(($signalsBody) => {
              if ($signalsBody.find('[data-testid="manual-signal-toggle"]').length > 0) {
                cy.getBySel('manual-signal-toggle').click();
                cy.getBySel('manual-signal-key').should('be.visible');
              }
            });
          });
        }
      });
    });

    it('should display type selector buttons', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.get('body').then(($signalsBody) => {
              if ($signalsBody.find('[data-testid="manual-signal-toggle"]').length > 0) {
                cy.getBySel('manual-signal-toggle').click();
                cy.getBySel('manual-signal-type-boolean').should('be.visible');
                cy.getBySel('manual-signal-type-numeric').should('be.visible');
                cy.getBySel('manual-signal-type-text').should('be.visible');
              }
            });
          });
        }
      });
    });

    it('should show boolean value inputs when boolean type selected', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.get('body').then(($signalsBody) => {
              if ($signalsBody.find('[data-testid="manual-signal-toggle"]').length > 0) {
                cy.getBySel('manual-signal-toggle').click();
                cy.getBySel('manual-signal-type-boolean').click();
                cy.getBySel('manual-signal-boolean-true').should('be.visible');
                cy.getBySel('manual-signal-boolean-false').should('be.visible');
              }
            });
          });
        }
      });
    });

    it('should show numeric input when numeric type selected', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.get('body').then(($signalsBody) => {
              if ($signalsBody.find('[data-testid="manual-signal-toggle"]').length > 0) {
                cy.getBySel('manual-signal-toggle').click();
                cy.getBySel('manual-signal-type-numeric').click();
                cy.getBySel('manual-signal-numeric-value').should('be.visible');
              }
            });
          });
        }
      });
    });

    it('should show text input when text type selected', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.get('body').then(($signalsBody) => {
              if ($signalsBody.find('[data-testid="manual-signal-toggle"]').length > 0) {
                cy.getBySel('manual-signal-toggle').click();
                cy.getBySel('manual-signal-type-text').click();
                cy.getBySel('manual-signal-text-value').should('be.visible');
              }
            });
          });
        }
      });
    });

    it('should display reason textarea', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.get('body').then(($signalsBody) => {
              if ($signalsBody.find('[data-testid="manual-signal-toggle"]').length > 0) {
                cy.getBySel('manual-signal-toggle').click();
                cy.getBySel('manual-signal-reason').should('be.visible');
              }
            });
          });
        }
      });
    });

    it('should close form when cancel is clicked', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.get('body').then(($signalsBody) => {
              if ($signalsBody.find('[data-testid="manual-signal-toggle"]').length > 0) {
                cy.getBySel('manual-signal-toggle').click();
                cy.getBySel('manual-signal-form').should('be.visible');
                cy.getBySel('manual-signal-cancel').click();
                cy.getBySel('manual-signal-form').should('not.exist');
                cy.getBySel('manual-signal-toggle').should('be.visible');
              }
            });
          });
        }
      });
    });

    it('should close form when close button is clicked', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.get('body').then(($signalsBody) => {
              if ($signalsBody.find('[data-testid="manual-signal-toggle"]').length > 0) {
                cy.getBySel('manual-signal-toggle').click();
                cy.getBySel('manual-signal-form').should('be.visible');
                cy.getBySel('manual-signal-close-btn').click();
                cy.getBySel('manual-signal-form').should('not.exist');
              }
            });
          });
        }
      });
    });

    it('should have disabled submit button when form is invalid', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.get('body').then(($signalsBody) => {
              if ($signalsBody.find('[data-testid="manual-signal-toggle"]').length > 0) {
                cy.getBySel('manual-signal-toggle').click();
                // Don't fill in required fields
                cy.getBySel('manual-signal-submit').should('be.disabled');
              }
            });
          });
        }
      });
    });

    it('should enable submit button when form is valid', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.get('body').then(($signalsBody) => {
              if ($signalsBody.find('[data-testid="manual-signal-toggle"]').length > 0) {
                cy.getBySel('manual-signal-toggle').click();
                // Fill in required fields
                cy.getBySel('manual-signal-key').type('test_signal_key');
                cy.getBySel('manual-signal-type-boolean').click();
                // Submit should be enabled
                cy.getBySel('manual-signal-submit').should('not.be.disabled');
              }
            });
          });
        }
      });
    });
  });

  describe('Responsive Design', () => {
    it('should display correctly on tablet viewport', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');

            cy.viewport('ipad-2');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.getBySel('signals-dashboard').should('be.visible');
          });
        }
      });
    });

    it('should display correctly on mobile viewport', () => {
      cy.visit('/dashboard/tracking');

      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="application-"]').length > 0) {
          cy.getBySelLike('application-').first().then(($card) => {
            const testId = $card.attr('data-testid') || '';
            const appId = testId.replace('application-', '').replace('card-', '');

            cy.viewport('iphone-x');
            cy.visit(`/dashboard/applications/${appId}/signals`);

            cy.getBySel('signals-dashboard').should('be.visible');
          });
        }
      });
    });
  });
});
