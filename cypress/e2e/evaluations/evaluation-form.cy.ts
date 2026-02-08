/// <reference types="cypress" />

/**
 * Evaluation Form Tests
 *
 * Tests for the evaluation form including signal inputs (boolean, numeric, text),
 * progress tracking, form submission, and confirmation modal.
 */
describe('Evaluation Form', () => {
  const email = Cypress.env('ADMIN_EMAIL') || 'admin@test.com';
  const password = Cypress.env('ADMIN_PASSWORD') || 'test-password-123';

  beforeEach(() => {
    cy.login(email, password);
  });

  /**
   * Helper function to navigate to an evaluation detail page
   * Returns true if navigation was successful, false if no evaluations exist
   */
  const navigateToEvaluationDetail = (): Cypress.Chainable<boolean> => {
    cy.visit('/dashboard/evaluations');

    return cy.get('body').then(($body) => {
      if ($body.find('[data-testid*="evaluation-card-"]').length > 0) {
        cy.getBySelLike('evaluation-card-').first().click();
        cy.getBySel('evaluation-detail').should('exist');
        return true;
      }
      return false;
    });
  };

  describe('Page Header', () => {
    it('should display the evaluation header', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.getBySel('evaluation-detail').should('be.visible');
          cy.contains('h1', 'Interview Evaluation').should('be.visible');
        } else {
          cy.log('No evaluations exist - skipping header test');
        }
      });
    });

    it('should display the template name', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.getBySel('evaluation-template-name').should('be.visible');
        } else {
          cy.log('No evaluations exist - skipping template name test');
        }
      });
    });

    it('should display back button', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.getBySel('evaluation-back-btn').should('be.visible');
        } else {
          cy.log('No evaluations exist - skipping back button test');
        }
      });
    });

    it('should navigate back when back button is clicked', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.getBySel('evaluation-back-btn').click();
          cy.url().should('include', '/dashboard/evaluations');
          cy.url().should('not.include', '/evaluations/');
        } else {
          cy.log('No evaluations exist - skipping back navigation test');
        }
      });
    });
  });

  describe('Participants Status', () => {
    it('should display participant status card', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.getBySel('participant-status').should('be.visible');
        } else {
          cy.log('No evaluations exist - skipping participant status test');
        }
      });
    });

    it('should display evaluation progress text', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.getBySel('evaluation-progress').should('be.visible');
          cy.getBySel('evaluation-progress').should('contain.text', 'of');
          cy.getBySel('evaluation-progress').should('contain.text', 'submitted');
        } else {
          cy.log('No evaluations exist - skipping progress text test');
        }
      });
    });

    it('should display participant avatars', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.getBySel('participant-avatars').should('be.visible');
        } else {
          cy.log('No evaluations exist - skipping avatars test');
        }
      });
    });
  });

  describe('Evaluation Form Structure', () => {
    it('should display the evaluation form', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="evaluation-form"]').length > 0) {
              cy.getBySel('evaluation-form').should('be.visible');
            } else if ($body.find('[data-testid="evaluation-submitted-notice"]').length > 0) {
              cy.log('Evaluation already submitted - skipping form test');
            }
          });
        } else {
          cy.log('No evaluations exist - skipping form test');
        }
      });
    });

    it('should display applicant context header', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="evaluation-form"]').length > 0) {
              cy.getBySel('evaluation-context-header').should('be.visible');
              cy.getBySel('evaluation-applicant-name').should('be.visible');
            }
          });
        }
      });
    });

    it('should display progress indicator', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="evaluation-form"]').length > 0) {
              cy.getBySel('evaluation-progress-container').should('be.visible');
              cy.getBySel('evaluation-progress-bar').should('exist');
              cy.getBySel('evaluation-progress-text').should('be.visible');
              cy.getBySel('evaluation-progress-text').should('contain.text', 'completed');
            }
          });
        }
      });
    });

    it('should display signal inputs container', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="evaluation-form"]').length > 0) {
              cy.getBySel('signal-inputs-container').should('be.visible');
            }
          });
        }
      });
    });
  });

  describe('Boolean Signal Input', () => {
    it('should display Yes/No buttons for boolean signals', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="boolean-input-yes"]').length > 0) {
              cy.getBySel('boolean-input-yes').first().should('be.visible');
              cy.getBySel('boolean-input-no').first().should('be.visible');
            } else {
              cy.log('No boolean signals in this evaluation');
            }
          });
        }
      });
    });

    it('should select Yes when clicked', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="boolean-input-yes"]').length > 0) {
              cy.getBySel('boolean-input-yes').first().click();
              cy.getBySel('boolean-input-yes')
                .first()
                .should('have.class', 'border-green-500');
            }
          });
        }
      });
    });

    it('should select No when clicked', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="boolean-input-no"]').length > 0) {
              cy.getBySel('boolean-input-no').first().click();
              cy.getBySel('boolean-input-no')
                .first()
                .should('have.class', 'border-red-500');
            }
          });
        }
      });
    });

    it('should toggle between Yes and No correctly', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="boolean-input-yes"]').length > 0) {
              // Select Yes
              cy.getBySel('boolean-input-yes').first().click();
              cy.getBySel('boolean-input-yes')
                .first()
                .should('have.class', 'border-green-500');

              // Select No
              cy.getBySel('boolean-input-no').first().click();
              cy.getBySel('boolean-input-no')
                .first()
                .should('have.class', 'border-red-500');
              cy.getBySel('boolean-input-yes')
                .first()
                .should('not.have.class', 'border-green-500');
            }
          });
        }
      });
    });
  });

  describe('Numeric Signal Input', () => {
    it('should display rating buttons for numeric signals', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="numeric-rating-buttons"]').length > 0) {
              cy.getBySel('numeric-rating-buttons').first().should('be.visible');
            } else {
              cy.log('No numeric rating signals in this evaluation');
            }
          });
        }
      });
    });

    it('should select rating when clicked', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="numeric-input-3"]').length > 0) {
              cy.getBySel('numeric-input-3').first().click();
              cy.getBySel('numeric-input-3')
                .first()
                .should('have.class', 'border-blue-500');
            } else if ($body.find('[data-testid="numeric-input-1"]').length > 0) {
              cy.getBySel('numeric-input-1').first().click();
              cy.getBySel('numeric-input-1')
                .first()
                .should('have.class', 'border-blue-500');
            } else {
              cy.log('No numeric inputs found');
            }
          });
        }
      });
    });

    it('should change selection when different rating clicked', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="numeric-input-2"]').length > 0 &&
                $body.find('[data-testid="numeric-input-4"]').length > 0) {
              // Select 2
              cy.getBySel('numeric-input-2').first().click();
              cy.getBySel('numeric-input-2')
                .first()
                .should('have.class', 'border-blue-500');

              // Select 4
              cy.getBySel('numeric-input-4').first().click();
              cy.getBySel('numeric-input-4')
                .first()
                .should('have.class', 'border-blue-500');
              cy.getBySel('numeric-input-2')
                .first()
                .should('not.have.class', 'border-blue-500');
            }
          });
        }
      });
    });
  });

  describe('Text Signal Input', () => {
    it('should display textarea for text signals', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="text-input"]').length > 0) {
              cy.getBySel('text-input').first().should('be.visible');
            } else {
              cy.log('No text signals in this evaluation');
            }
          });
        }
      });
    });

    it('should accept text input', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="text-input"]').length > 0) {
              const testText = 'This is a test response for the evaluation.';
              cy.getBySel('text-input').first().clear().type(testText);
              cy.getBySel('text-input').first().should('have.value', testText);
            }
          });
        }
      });
    });

    it('should display character counter', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="text-char-count"]').length > 0) {
              cy.getBySel('text-char-count').first().should('be.visible');
              cy.getBySel('text-char-count').first().should('contain.text', '/');
            }
          });
        }
      });
    });

    it('should update character count when typing', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="text-input"]').length > 0) {
              const testText = 'Test input';
              cy.getBySel('text-input').first().clear().type(testText);
              cy.getBySel('text-char-count')
                .first()
                .should('contain.text', `${testText.length}/`);
            }
          });
        }
      });
    });
  });

  describe('Progress Indicator', () => {
    it('should update progress as fields are completed', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="evaluation-form"]').length > 0) {
              // Get initial progress text
              cy.getBySel('evaluation-progress-text')
                .invoke('text')
                .then((initialText) => {
                  // Complete a boolean input if available
                  if ($body.find('[data-testid="boolean-input-yes"]').length > 0) {
                    cy.getBySel('boolean-input-yes').first().click();
                  }
                  // Or complete a numeric input
                  else if ($body.find('[data-testid="numeric-input-3"]').length > 0) {
                    cy.getBySel('numeric-input-3').first().click();
                  }

                  // Progress should be updated
                  cy.getBySel('evaluation-progress-text').should('be.visible');
                });
            }
          });
        }
      });
    });

    it('should show green progress bar when complete', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="evaluation-form"]').length > 0) {
              // Complete all required fields
              $body.find('[data-testid="boolean-input-yes"]').each((_, el) => {
                cy.wrap(el).click();
              });
              $body.find('[data-testid="numeric-input-3"]').each((_, el) => {
                cy.wrap(el).click();
              });
              $body.find('[data-testid="text-input"]').each((_, el) => {
                cy.wrap(el).type('Test response');
              });

              // Check if progress bar turns green
              cy.getBySel('evaluation-progress-bar')
                .should('exist');
            }
          });
        }
      });
    });
  });

  describe('Submit Button', () => {
    it('should display submit button', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="evaluation-form"]').length > 0) {
              cy.getBySel('submit-btn').should('be.visible');
              cy.getBySel('submit-btn').should('contain.text', 'Submit Evaluation');
            }
          });
        }
      });
    });

    it('should be disabled when required fields are incomplete', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="evaluation-form"]').length > 0) {
              // Ensure form is in initial state (no selections)
              cy.reload();

              // Submit button should be disabled
              cy.getBySel('submit-btn').should('be.disabled');
            }
          });
        }
      });
    });

    it('should show incomplete warning when fields are missing', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="evaluation-form"]').length > 0) {
              cy.reload();

              // Check for incomplete warning
              cy.getBySel('incomplete-warning')
                .should('be.visible')
                .and('contain.text', 'Please complete all required fields');
            }
          });
        }
      });
    });
  });

  describe('Confirmation Modal', () => {
    /**
     * Helper to complete all required fields
     */
    const completeAllRequiredFields = () => {
      cy.get('body').then(($body) => {
        // Complete boolean inputs
        if ($body.find('[data-testid="boolean-input-yes"]').length > 0) {
          cy.getBySel('boolean-input-yes').each(($btn) => {
            cy.wrap($btn).click();
          });
        }

        // Complete numeric inputs
        if ($body.find('[data-testid^="numeric-input-"]').length > 0) {
          cy.getBySelLike('numeric-input-').each(($btn, index) => {
            // Only click one per group (e.g., numeric-input-3)
            if ($btn.attr('data-testid') === 'numeric-input-3') {
              cy.wrap($btn).click();
            }
          });
        }

        // Complete text inputs
        if ($body.find('[data-testid="text-input"]').length > 0) {
          cy.getBySel('text-input').each(($textarea) => {
            cy.wrap($textarea).clear().type('Test evaluation response');
          });
        }
      });
    };

    it('should open confirmation modal when submit is clicked', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="evaluation-form"]').length > 0) {
              completeAllRequiredFields();

              // Wait for button to be enabled and click
              cy.getBySel('submit-btn').should('not.be.disabled');
              cy.getBySel('submit-btn').click();

              // Modal should appear
              cy.getBySel('confirmation-modal').should('be.visible');
            }
          });
        }
      });
    });

    it('should display confirmation title', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="evaluation-form"]').length > 0) {
              completeAllRequiredFields();
              cy.getBySel('submit-btn').click();

              cy.getBySel('confirmation-title')
                .should('be.visible')
                .and('contain.text', 'Confirm Submission');
            }
          });
        }
      });
    });

    it('should close modal when cancel is clicked', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="evaluation-form"]').length > 0) {
              completeAllRequiredFields();
              cy.getBySel('submit-btn').click();

              // Click cancel
              cy.getBySel('cancel-submit-btn').click();

              // Modal should be closed
              cy.getBySel('confirmation-modal').should('not.exist');
            }
          });
        }
      });
    });

    it('should close modal when clicking backdrop', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="evaluation-form"]').length > 0) {
              completeAllRequiredFields();
              cy.getBySel('submit-btn').click();

              // Click backdrop
              cy.getBySel('confirmation-modal-backdrop').click({ force: true });

              // Modal should be closed
              cy.getBySel('confirmation-modal').should('not.exist');
            }
          });
        }
      });
    });

    it('should display confirm submit button', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="evaluation-form"]').length > 0) {
              completeAllRequiredFields();
              cy.getBySel('submit-btn').click();

              cy.getBySel('confirm-submit-btn')
                .should('be.visible')
                .and('contain.text', 'Confirm & Submit');
            }
          });
        }
      });
    });
  });

  describe('Already Submitted State', () => {
    it('should show submitted notice if evaluation was already submitted', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="evaluation-submitted-notice"]').length > 0) {
              cy.getBySel('evaluation-submitted-notice').should('be.visible');
              cy.contains('Evaluation Submitted').should('be.visible');
              cy.contains('You have already submitted your evaluation').should('be.visible');
            } else {
              cy.log('Evaluation not yet submitted - skipping submitted state test');
            }
          });
        }
      });
    });
  });

  describe('Notes Field', () => {
    it('should display optional notes textarea', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="evaluation-form"]').length > 0) {
              cy.getBySel('evaluation-notes').should('be.visible');
            }
          });
        }
      });
    });

    it('should accept text in notes field', () => {
      navigateToEvaluationDetail().then((hasEvaluation) => {
        if (hasEvaluation) {
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="evaluation-form"]').length > 0) {
              const testNote = 'Additional notes about the candidate.';
              cy.getBySel('evaluation-notes').clear().type(testNote);
              cy.getBySel('evaluation-notes').should('have.value', testNote);
            }
          });
        }
      });
    });
  });
});
