/// <reference types="cypress" />

// The "No routes found" error originates from the Expo Router. We can safely ignore it.
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('No routes found')) {
    return false;
  }
  return true;
});

describe('Client User Flow', () => {
  it('should allow a user to register, login, and book a service', () => {
    const userEmail = `testclient_${Date.now()}@example.com`;

    cy.visit('/');
    // Wait for the page to be interactive by checking for a known element
    cy.contains('Register', { timeout: 60000 }).should('be.visible');

    // 1. Register a new client account
    cy.contains('Register').click();
    cy.url().should('include', '/register');
    cy.get('input[placeholder="Full Name"]').type('Test Client');
    cy.get('input[placeholder="Email"]').type(userEmail);
    cy.get('input[placeholder="Phone Number"]').type('1234567890');
    cy.get('input[placeholder="Password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/register'); // Wait for redirection

    // 2. Login with the new account
    cy.contains('Login').click();
    cy.url().should('include', '/login');
    cy.get('input[placeholder="Email"]').type(userEmail);
    cy.get('input[placeholder="Password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard'); // Assuming successful login redirects to dashboard

    // 3. Navigate to booking
    cy.contains('Book a Service').click();
    cy.url().should('include', '/booking');

    // 4. Select a service and book
    cy.contains('Plumbing').click();
    cy.contains('Select').click();
    cy.get('textarea[placeholder="Describe your issue"]').type('Leaky faucet in the kitchen.');
    cy.get('input[placeholder="Location"]').type('123 Main St, Anytown');
    cy.contains('Confirm Booking').click();

    // 5. Verify booking confirmation
    cy.contains('Booking Confirmed!').should('be.visible');
  });
});
