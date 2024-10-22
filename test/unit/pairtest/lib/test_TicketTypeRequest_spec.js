import TicketTypeRequest from "../../../../src/pairtest/lib/TicketTypeRequest.js";

describe("The ticket type request object", function () {
  it("Should reject creating an object with a non-integer ticket count", function () {
    expect(() => new TicketTypeRequest("ADULT", "abc")).to.Throw(
      /noOfTickets must be an integer/i,
    );
  });

  it("Should reject creating an object with a non-valid type", function () {
    expect(() => new TicketTypeRequest("SENIOR",1,)).to.Throw(
      /type must be ADULT, CHILD, or INFANT/i,
    );
  });

  it("Should successfully create an object when all parameters are correct", function () {
    const typeRequest = new TicketTypeRequest("ADULT", 1);

    expect(typeRequest.getTicketType()).to.equal("ADULT");
    expect(typeRequest.getNoOfTickets()).to.equal(1);
  });
});
