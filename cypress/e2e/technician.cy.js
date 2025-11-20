/// <reference types="cypress" />

// The "No routes found" error originates from the Expo Router. We can safely ignore it.
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('No routes found')) {
    return false;
  }
  return true;
});

describe('Technician User Flow', () => {
  it('should allow a technician to view and manage jobs', () => {
    // For this test, we'll assume a technician account already exists.
    // You would typically create one via an API call or programmatically in a real-world scenario.
    cy.visit('/login');
    cy.contains('Login', { timeout: 10000 }).should('be.visible');

    cy.get('input[placeholder="Email"]').type('technician@example.com'); // Use a pre-existing technician email
    cy.get('input[placeholder="Password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/technician-dashboard'); // Assuming redirect to technician dashboard

    // 1. View assigned jobs
    cy.contains('Assigned Jobs').should('be.visible');
    cy.get('.job-list-item').should('have.length.greaterThan', 0); // Check that jobs are listed

    // 2. Click on a job to see details
    cy.get('.job-list-item').first().click();
    cy.url().should('include', '/job-details/');
    cy.contains('Job Details').should('be.visible');
    cy.contains('Client:').should('be.visible');
    cy.contains('Service:').should('be.visible');

    // 3. Mark a job as complete
    cy.contains('Mark as Complete').click();
    cy.contains('Job status updated successfully').should('be.visible');

    // 4. Navigate back to the dashboard and verify the job is moved to completed
    cy.visit('/technician-dashboard');
    cy.contains('Completed Jobs').click();
    cy.get('.completed-job-list-item').should('have.length.greaterThan', 0);
  });
});
