import { Given, When, Then, Before, world } from "@cucumber/cucumber";
import { expect } from "chai";
import TicketService from "../../../../../src/pairtest/TicketService.js";
import TicketTypeRequest from "../../../../../src/pairtest/lib/TicketTypeRequest.js";

Before({ name: "Setting up basic parameters" }, () => {
  world.ticketService = new TicketService();
  world.accountId = 12345;
  world.ticketRequest = [];
});

Given("no tickets are being bought", () => {
  // Do nothing
});

Given(/^I request ([0-9]+) (.*) tickets?$/i, (ticketCount, ticketType) => {
  const parsedCount = parseInt(ticketCount, 10);
  if (parsedCount > 0) {
    world.ticketRequest.push(new TicketTypeRequest(ticketType, parsedCount));
  }
});

Given(
  /^I explicitly request ([0-9]+) (.*) tickets?$/i,
  (ticketCount, ticketType) => {
    world.ticketRequest.push(
      new TicketTypeRequest(ticketType, parseInt(ticketCount, 10)),
    );
  },
);

When("a request to purchase tickets is made", () => {
  try {
    world.purchaseResponse = this.ticketService.purchaseTickets(
      this.accountId,
      ...this.ticketRequest,
    );
  } catch (invalidPurchase) {
    world.exception = invalidPurchase;
  }
});

Then("an error for no tickets purchased should be thrown", () => {
  expect(world.exception.message).to.equal(
    "At least one ticket must be purchased",
  );
});

Then(
  /^an error for requiring at least ([0-9]+) adult tickets? should be thrown$/i,
  (ticketCount) => {
    expect(world.exception.message).to.equal(
      `At least ${ticketCount} adult ticket(s) are required for this transaction`,
    );
  },
);

Then(
  /^an error showing that ([0-9]+) tickets is above the max of ([0-9]+) should be thrown$/i,
  (totalDiscovered, maxCount) => {
    expect(world.exception.message).to.equal(
      `A maximum of ${maxCount} tickets can be booked in one transaction. ${totalDiscovered} attempted.`,
    );
  },
);

Then("the receipt of the purchase should be returned", () => {
  expect(world.purchaseResponse).to.not.be.undefined;
});

Then(/^([0-9]+) seats should be reserved$/i, (seatCount) => {
  expect(world.purchaseResponse.reservedSeats).to.equal(seatCount);
});
