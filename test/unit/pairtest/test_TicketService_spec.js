import sinon from "sinon";

import TicketService from "../../../src/pairtest/TicketService.js";
import TicketPaymentService from "../../../src/thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "../../../src/thirdparty/seatbooking/SeatReservationService.js";

describe("The cinema ticket service", function () {
  let ticketService;
  let paymentStub;
  let reservationStub;

  before(function () {
    paymentStub = sinon.createStubInstance(TicketPaymentService);
    reservationStub = sinon.createStubInstance(SeatReservationService);
    ticketService = new TicketService(paymentStub, reservationStub);
  });

  after(function () {});

  describe("Regular usage of the interface", function () {
    describe("Minimum adult ticket usage", function () {
      it("Should accept an adult requesting a ticket", function () {
        const tickets = [{ count: 1, type: "ADULT" }];
        const receipt = ticketService.purchaseTickets(1, ...tickets);

        expect(receipt.getSeatsReserved()).to.equal(1);
        expect(receipt.getTotalCost()).to.equal(25);
        expect(receipt.getTicketsOrdered()).to.equal(1);
      });

      it("Should reject a ticket request for only children", function () {
        const tickets = [{ count: 1, type: "CHILD" }];
        expect(() => ticketService.purchaseTickets(1, ...tickets)).to.throw(
          /At least 1 adult ticket\(s\) are required/i,
        );
      });

      it("Should accept tickets for an adult and a child together", function () {
        const tickets = [
          { count: 1, type: "ADULT" },
          { count: 1, type: "CHILD" },
        ];
        const receipt = ticketService.purchaseTickets(1, ...tickets);

        expect(receipt.getSeatsReserved()).to.equal(2);
        expect(receipt.getTotalCost()).to.equal(40);
        expect(receipt.getTicketsOrdered()).to.equal(2);
      });
    });

    describe("Adults accompanying infants", function () {
      it("Should reject an infant by themselves", function () {
        const tickets = [{ count: 1, type: "INFANT" }];
        expect(() => ticketService.purchaseTickets(1, ...tickets)).to.throw(
          /At least 1 adult ticket\(s\) are required/i,
        );
      });

      it("Should accept an infant travelling with an adult", function () {
        const tickets = [
          { count: 1, type: "INFANT" },
          { count: 1, type: "ADULT" },
        ];
        const receipt = ticketService.purchaseTickets(1, ...tickets);

        expect(receipt.getSeatsReserved()).to.equal(1);
        expect(receipt.getTotalCost()).to.equal(25);
        expect(receipt.getTicketsOrdered()).to.equal(2);
      });

      it("Should reject where there are more infants than adults", function () {
        const tickets = [
          { count: 3, type: "INFANT" },
          { count: 1, type: "ADULT" },
        ];
        expect(() => ticketService.purchaseTickets(1, ...tickets)).to.throw(
          /At least 3 adult ticket\(s\) are required/i,
        );
      });

      it("Should accept where there are multiple groups of adults", function () {
        const tickets = [
          { count: 3, type: "INFANT" },
          { count: 1, type: "ADULT" },
          { count: 1, type: "ADULT" },
          { count: 1, type: "ADULT" },
        ];
        const receipt = ticketService.purchaseTickets(1, ...tickets);

        expect(receipt.getSeatsReserved()).to.equal(3);
        expect(receipt.getTotalCost()).to.equal(75);
        expect(receipt.getTicketsOrdered()).to.equal(6);
      });
    });

    describe("Max ticket limits", function () {
      it("Should reject requests for more than 25 single tickets", function () {
        const tickets = [{ count: 26, type: "ADULT" }];
        expect(() => ticketService.purchaseTickets(1, ...tickets)).to.throw(
          /A maximum of 25 tickets can be booked in one transaction/i,
        );
      });

      it("Should reject requests for more than 25 combined tickets", function () {
        const tickets = [
          { count: 10, type: "ADULT" },
          { count: 10, type: "ADULT" },
          { count: 10, type: "ADULT" },
        ];
        expect(() => ticketService.purchaseTickets(1, ...tickets)).to.throw(
          /A maximum of 25 tickets can be booked in one transaction/i,
        );
      });

      it("Should reject requests for more than 25 tickets including infants", function () {
        const tickets = [
          { count: 10, type: "ADULT" },
          { count: 10, type: "ADULT" },
          { count: 10, type: "INFANT" },
        ];
        expect(() => ticketService.purchaseTickets(1, ...tickets)).to.throw(
          /A maximum of 25 tickets can be booked in one transaction/i,
        );
      });
    });
  });

  describe("Irregular usage of the interface", function () {
    it("Should error when no parameters are provided to the interface", function () {
      expect(() => ticketService.purchaseTickets()).to.throw(
        /please provide an account ID and tickets to buy/i,
      );
    });

    describe("The account number", function () {
      it("Should error when a zero account number is provided", function () {
        expect(() =>
          ticketService.purchaseTickets(0, { count: 1, type: "ADULT" }),
        ).to.throw(/please provide a valid account number/i);
      });

      it("Should error when a negative account number is provided", function () {
        expect(() =>
          ticketService.purchaseTickets(-1, { count: 1, type: "ADULT" }),
        ).to.throw(/please provide a valid account number/i);
      });

      it("Should error when a non-numeric account number is provided", function () {
        expect(() =>
          ticketService.purchaseTickets("abc", { count: 1, type: "ADULT" }),
        ).to.throw(/please provide a valid account number/i);
      });
    });

    describe("The list of tickets", function () {
      it("Should error when no ticket requests are provided", function () {
        const tickets = [];
        expect(() => ticketService.purchaseTickets(1, ...tickets)).to.throw(
          /at least one ticket must be purchased/i,
        );
      });

      it("Should error when negative ticket requests are provided", function () {
        const tickets = [{ count: -1, type: "ADULT" }];
        expect(() => ticketService.purchaseTickets(1, ...tickets)).to.throw(
          /invalid ticket request found. please ensure all tickets are of a valid type and have a count above 0./i,
        );
      });

      it("Should error when 0 tickets are explicitly requested", function () {
        const tickets = [{ count: 0, type: "ADULT" }];
        expect(() => ticketService.purchaseTickets(1, ...tickets)).to.throw(
          /invalid ticket request found. please ensure all tickets are of a valid type and have a count above 0./i,
        );
      });

      it("Should error when a blank type is requested", function () {
        const tickets = [{ count: 0, type: "" }];
        expect(() => ticketService.purchaseTickets(1, ...tickets)).to.throw(
          /invalid ticket request found. please ensure all tickets are of a valid type and have a count above 0./i,
        );
      });

      it("Should error when an unknown type is requested", function () {
        const tickets = [{ count: 0, type: "SENIOR" }];
        expect(() => ticketService.purchaseTickets(1, ...tickets)).to.throw(
          /invalid ticket request found. please ensure all tickets are of a valid type and have a count above 0./i,
        );
      });

      it("Should error when invalid ticket requests are made with no count", function () {
        const tickets = [{ type: "ADULT" }];
        expect(() => ticketService.purchaseTickets(1, ...tickets)).to.throw(
          /invalid ticket request found. please ensure all tickets are of a valid type and have a count above 0./i,
        );
      });

      it("Should error when invalid ticket requests are made with no type", function () {
        const tickets = [{ count: -1 }];
        expect(() => ticketService.purchaseTickets(1, ...tickets)).to.throw(
          /invalid ticket request found. please ensure all tickets are of a valid type and have a count above 0./i,
        );
      });
    });
  });
});
