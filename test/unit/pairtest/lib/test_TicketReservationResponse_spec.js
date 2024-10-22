import TicketReservationResponse from "../../../../src/pairtest/lib/TicketReservationResponse.js";

describe("The ticket reservation response object", function () {
  it("Should reject creating an object with a non-integer ticket count", function () {
    expect(() => new TicketReservationResponse("abc", 1, 1)).to.Throw(
      /ticketsOrdered must be an integer/i,
    );
  });

  it("Should reject creating an object with a non-integer cost", function () {
    expect(() => new TicketReservationResponse(1, "abc", 1)).to.Throw(
      /totalCost must be an integer/i,
    );
  });

  it("Should reject creating an object with a non-integer seat reservation count", function () {
    expect(() => new TicketReservationResponse(1, 1, "abc")).to.Throw(
      /seatsReserved must be an integer/i,
    );
  });

  it("Should successfully create an object when all parameters are numeric", function () {
    const reservationResponse = new TicketReservationResponse(1, 2, 3);

    expect(reservationResponse.getTicketsOrdered()).to.equal(1);
    expect(reservationResponse.getTotalCost()).to.equal(2);
    expect(reservationResponse.getSeatsReserved()).to.equal(3);
  });
});
