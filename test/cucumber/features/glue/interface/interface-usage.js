import { Given, When, Then, Before, world } from "@cucumber/cucumber";
import { expect } from "chai";
import TicketService from "../../../../../src/pairtest/TicketService.js";
import TicketPaymentService from "../../../../../src/thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "../../../../../src/thirdparty/seatbooking/SeatReservationService.js";

Before({ name: "Setting up basic parameters" }, () => {
  world.paymentService = new TicketPaymentService();
  world.reservationService = new SeatReservationService();
  world.ticketService = new TicketService(
    world.paymentService,
    world.reservationService,
  );
  world.accountId = 12345;
  world.ticketRequest = [];
});

Given(/my account id is (.*)/, (acctId) => {
  if (isNaN(acctId)) {
    world.accountId = acctId;
  } else {
    world.accountId = parseInt(acctId, 10);
  }
});

Given("no tickets are being bought", () => {
  // Do nothing
});

Given(/^I request (-?[0-9]+) (.*) tickets?$/i, (ticketCount, ticketType) => {
  const parsedCount = parseInt(ticketCount, 10);
  if (parsedCount > 0) {
    world.ticketRequest.push({ count: parsedCount, type: ticketType });
  }
});

Given(
  /^I explicitly request (-?[0-9]+) (.*) tickets?$/i,
  (ticketCount, ticketType) => {
    world.ticketRequest.push({
      count: parseInt(ticketCount, 10),
      type: ticketType,
    });
  },
);

When("a request to purchase tickets is made", () => {
  try {
    world.purchaseResponse = world.ticketService.purchaseTickets(
      world.accountId,
      ...world.ticketRequest,
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
  /an error that an invalid account id was presented should be shown/,
  () => {
    expect(world.exception.message).to.equal(
      `Account ID must be a non-negative number above 0`,
    );
  },
);

Then(
  /an error that an invalid ticket was presented should be shown with the detail of (.*)/,
  (errorDetail) => {
    expect(world.exception.message).to.equal(
      `Invalid ticket request found. ${errorDetail}`,
    );
  },
);

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
      `A maximum of ${maxCount} tickets can be booked in one transaction`,
    );
  },
);

Then("the receipt of the purchase should be returned", () => {
  expect(world.purchaseResponse).to.not.be.undefined;
});

Then(/^([0-9]+) tickets? should have been ordered$/i, (ticketsOrdered) => {
  expect(world.purchaseResponse.getTicketsOrdered()).to.equal(
    parseInt(ticketsOrdered, 10),
  );
});

Then(/^the order total should have equalled ([0-9]+)$/i, (totalCost) => {
  expect(world.purchaseResponse.getTotalCost()).to.equal(
    parseInt(totalCost, 10),
  );
});

Then(/^([0-9]+) seats? should be reserved$/i, (seatCount) => {
  expect(world.purchaseResponse.getSeatsReserved()).to.equal(
    parseInt(seatCount, 10),
  );
});
