/// <reference types="cypress" />

// The "No routes found" error originates from the Expo Router. We can safely ignore it.
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('No routes found')) {
    return false;
  }
  return true;
});

describe('Admin User Flow', () => {
  it('should allow an admin to manage users and services', () => {
    // We'll assume an admin account already exists.
    cy.visit('/login');
    cy.contains('Login', { timeout: 10000 }).should('be.visible');
    
    cy.get('input[placeholder="Email"]').type('admin@example.com'); // Use a pre-existing admin email
    cy.get('input[placeholder="Password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/admin-dashboard'); // Assuming redirect to admin dashboard

    // 1. Manage Users
    cy.contains('Manage Users').click();
    cy.url().should('include', '/admin/users');
    cy.get('.user-list-item').should('have.length.greaterThan', 0);

    // 2. View a user's details
    cy.get('.user-list-item').first().click();
    cy.contains('User Details').should('be.visible');

    // 3. Deactivate a user (example action)
    cy.contains('Deactivate User').click();
    cy.contains('User deactivated successfully').should('be.visible');

    // 4. Manage Services
    cy.visit('/admin-dashboard');
    cy.contains('Manage Services').click();
    cy.url().should('include', '/admin/services');
    cy.get('.service-list-item').should('have.length.greaterThan', 0);

    // 5. Add a new service
    cy.contains('Add New Service').click();
    cy.get('input[placeholder="Service Name"]').type('New Test Service');
    cy.get('textarea[placeholder="Service Description"]').type('A brand new service for testing.');
    cy.contains('Save Service').click();
    cy.contains('Service added successfully').should('be.visible');
    cy.contains('New Test Service').should('be.visible');
  });
});
