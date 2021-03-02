export const restaurantStepsShouldExist = () => {
  // step 1
  cy.contains("Plan Your Location").should("exist");
  cy.contains("Identify a potential lease").should("exist");
  cy.contains("Verify zoning").should("exist");
  cy.contains("Inquire about Local Permits Required").should("exist");

  // step 2
  cy.contains("Research and Prepare Your Business License").should("exist");

  // step 4
  cy.contains("Sign Your Lease & File Local Permits").should("exist");
  cy.contains("Sign Your Lease").should("exist");
  cy.contains("Obtain Building Permit").should("exist");
  cy.contains("Get your floor plan approved by your local DOH").should("exist");
  cy.contains("Complete Food Safety Course").should("exist");

  // not have ecommerce tasks
  cy.contains("Search Licenses").should("not.exist");
  // not have home contractor tasks
  cy.contains("Register with the N.J. Division of Consumer Affairs").should("not.exist");
};

export const ecommerceStepsShouldExist = () => {
  // step 1
  cy.contains("Plan Your Location").should("exist");
  cy.contains("Zoning Requirements").should("exist");

  // step 2
  cy.contains("Research and Prepare Your Business License").should("exist");
  cy.contains("Search Licenses").should("exist");

  // step 4
  cy.contains("Sign Your Lease & File Local Permits").should("exist");
  cy.contains("Municipality Licenses").should("exist");

  // not have restaurant tasks
  cy.contains("Identify a potential lease").should("not.exist");
  // not have home contractor tasks
  cy.contains("Register with the N.J. Division of Consumer Affairs").should("not.exist");
};

export const homeContractorStepsShouldExist = () => {
  // step 1
  cy.contains("Plan Your Location").should("exist");
  cy.contains("Zoning Requirements").should("exist");

  // step 2
  cy.contains("Research and Prepare Your Business License").should("exist");
  cy.contains("Register with the N.J. Division of Consumer Affairs").should("exist");

  // step 4
  cy.contains("Sign Your Lease & File Local Permits").should("exist");
  cy.contains("Municipality Licenses").should("exist");

  // not have restaurant tasks
  cy.contains("Identify a potential lease").should("not.exist");
  // not have ecommerce tasks
  cy.contains("Search Licenses").should("not.exist");
};

export const llcStepShouldExist = () => {
  // step 3 - LLC
  cy.contains("Form & Register Your Business").should("exist");
  cy.contains("Search for Available Business Names").should("exist");
  cy.contains("Register for an EIN").should("exist");
  cy.contains("Form your Business Entity").should("exist");
  cy.contains("Register Your Alternate Name").should("exist");
  cy.contains("Register for Tax Purposes with DORES").should("exist");

  // not have GP tasks
  cy.contains("Register a Trade Name").should("not.exist");
};

export const gpStepShouldExist = () => {
  // step 3 - GP
  cy.contains("Form & Register Your Business").should("exist");
  cy.contains("Register a Trade Name").should("exist");
  cy.contains("Register for an EIN").should("exist");
  cy.contains("Register for Tax Purposes with DORES").should("exist");

  // not have LLC tasks
  cy.contains("Search for Available Business Names").should("not.exist");
  cy.contains("Form your Business Entity").should("not.exist");
  cy.contains("Register Your Alternate Name").should("not.exist");
};

export const liquorLicenseShouldExist = () => {
  cy.contains("Confirm liquor license availability").should("exist");
  cy.contains("Obtain your Liquor License").should("exist");
};

export const liquorLicenseShouldNotExist = () => {
  cy.contains("Confirm liquor license availability").should("not.exist");
  cy.contains("Obtain your Liquor License").should("not.exist");
};