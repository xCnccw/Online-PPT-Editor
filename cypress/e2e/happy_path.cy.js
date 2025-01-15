describe('Admin User Happy Path Flow', () => {
    const timestamp = Date.now();
    const email = `testuser${timestamp}@example.com`;
    const password = 'Password123!';

    // Step 1: Register a new user
    it('Registers a new user successfully', () => {
        cy.visit('http://localhost:3000/register');

        // Fill in the registration form
        cy.get('input[name="email"]').type(email);
        cy.get('input[name="name"]').type('Test User');
        cy.get('input[name="password"]').type(password);
        cy.get('input[name="confirmPassword"]').type(password);
        cy.get('button').contains('Register').click();

        // Verify registration success
        cy.contains('Register successful!').should('be.visible');
        cy.url().should('include', '/login');
    });

    // // Step 2: Create a new presentation
    it('Creates a new presentation successfully', () => {
        cy.visit('http://localhost:3000/login');
        cy.get('input[name="email"]').type(email);
        cy.get('input[name="password"]').type(password);
        cy.get('button').contains('Login').click();
        cy.contains('New deck').click();
        cy.get('input[placeholder="Enter your slides name"]').type('Cypress Demo Presentation');
        cy.get('input[placeholder="Enter a brief description"]').type('Demo presentation created by Cypress.');
        cy.contains('Create').click();

        // Verify presentation creation success
        cy.contains('Cypress Demo Presentation').should('be.visible');
    });

    // // Step 3: Update the presentation name and thumbnail
    it('Updates the thumbnail and name of the presentation successfully', () => {
        cy.visit('http://localhost:3000/login');
        cy.get('input[name="email"]').type(email);
        cy.get('input[name="password"]').type(password);
        cy.get('button').contains('Login').click();
        cy.contains('Cypress Demo Presentation').click();
        cy.get('button').contains('Enter').click();

        // Update title
        cy.get('[aria-label="edit-title-button"]').click();
        cy.get('input[placeholder="New slides name"]').clear().type('Updated Demo Presentation');
        cy.contains('Update').click();

        // Upload a new thumbnail
        cy.contains('Change thumbnail').click();
        cy.get('input[type="file"]').selectFile('cypress/fixtures/new_thumbnail.png');
        cy.contains('Save').click();

        // Verify update success
        cy.contains('Updated Demo Presentation').should('be.visible');
    });

    // // Step 4: Add slides to the presentation
    it('Adds some slides in a slideshow deck successfully', () => {
        cy.visit('http://localhost:3000/login');
        cy.get('input[name="email"]').type(email);
        cy.get('input[name="password"]').type(password);
        cy.get('button').contains('Login').click();
        cy.wait(2000);
        cy.get('button').contains('Enter').click();

        cy.contains('Add slide').click();
        cy.contains('Slide Content Area').should('be.visible');

        cy.contains('Add slide').click();
        cy.contains('Slide Content Area').should('be.visible');
        cy.get('button[aria-label="Next Slide"]').click();
        // Verify slides added
        cy.get('div[aria-label="Slide Number"]').should('contain', '2');
    });

    // // Step 5: Switch between slides
    it('Switches between slides successfully', () => {
        cy.visit('http://localhost:3000/login');
        cy.get('input[name="email"]').type(email);
        cy.get('input[name="password"]').type(password);
        cy.get('button').contains('Login').click();
        cy.wait(2000);
        cy.get('button').contains('Enter').click();

        cy.get('button[aria-label="Next Slide"]').click();
        cy.get('div[aria-label="Slide Number"]').should('contain', '2');

        cy.get('button[aria-label="Previous Slide"]').click();
        cy.get('div[aria-label="Slide Number"]').should('contain', '1');
    });

    // Step 6: Delete the presentation
    it('Deletes a presentation successfully', () => {
        cy.visit('http://localhost:3000/login');
        cy.get('input[name="email"]').type(email);
        cy.get('input[name="password"]').type(password);
        cy.get('button').contains('Login').click();
        cy.wait(2000);
        cy.get('button').contains('Enter').click();

        cy.contains('Updated Demo Presentation').click();
        cy.get('button[aria-label="Delete presentation"]').click();
        cy.contains('Yes').click();
        cy.wait(1000);
        // Verify deletion success
        cy.contains('Updated Demo Presentation').should('not.exist');
    });

    // Step 7: Log out of the application
    it('Logs out of the application successfully', () => {
      cy.visit('http://localhost:3000/login');
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type(password);
      cy.get('button').contains('Login').click();
      cy.contains('Log Out').click();
      cy.contains('Login').should('be.visible');
    });

    // Step 8: Log back into the application
    it('Logs back into the application successfully', () => {
      cy.visit('http://localhost:3000/login');
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type(password);
      cy.get('button').contains('Login').click();

      // Verify login success
      cy.contains('Login successful!').should('be.visible');
      cy.url().should('include', '/dashboard');
    });
});
