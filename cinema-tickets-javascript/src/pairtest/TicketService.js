import TicketTypeRequest from "./lib/TicketTypeRequest.js";
import InvalidPurchaseException from "./lib/InvalidPurchaseException.js";
import TicketPaymentService from "../thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "../thirdparty/seatbooking/SeatReservationService.js";
import TicketReservationResponse from "./lib/TicketReservationResponse.js";

export default class TicketService {
  constructor() {
    this._paymentService = new TicketPaymentService();
    this._reservationService = new SeatReservationService();
  }

  /**
   * Should only have private methods other than the one below.
   */
  _simplifyTickets(baseMap, ongoingTicket) {
    baseMap[ongoingTicket.getTicketType()] += ongoingTicket.getNoOfTickets();
    return baseMap;
  }

  _validateTicketCount(ticketPurchaseMap) {
    const totalTickets = this._calculateTotalTickets(ticketPurchaseMap);
    if (totalTickets <= 0) {
      throw new InvalidPurchaseException(
        "At least one ticket must be purchased",
      );
    } else if (totalTickets > 25) {
      throw new InvalidPurchaseException(
        `A maximum of 25 tickets can be booked in one transaction`,
      );
    }
  }

  _validateRequiredAdults(ticketPurchaseMap) {
    let adultsRequired =
      ticketPurchaseMap["INFANT"] > 0 ? ticketPurchaseMap["INFANT"] : 1;

    if (ticketPurchaseMap["ADULT"] < adultsRequired) {
      throw new InvalidPurchaseException(
        `At least ${adultsRequired} adult ticket(s) are required for this transaction`,
      );
    }
  }

  _validateOrder(ticketPurchaseMap) {
    this._validateTicketCount(ticketPurchaseMap);
    this._validateRequiredAdults(ticketPurchaseMap);
  }

  _calculateTotalTickets(ticketPurchaseMap) {
    return Object.values(ticketPurchaseMap).reduce(
      (ongoingTotal, newPurchases) => ongoingTotal + newPurchases,
      0,
    );
  }

  _calculateOrderCost(ticketPurchaseMap) {
    return ticketPurchaseMap["ADULT"] * 25 + ticketPurchaseMap["CHILD"] * 15;
  }

  _calculateTotalSeats(ticketPurchaseMap) {
    return ticketPurchaseMap["ADULT"] + ticketPurchaseMap["CHILD"];
  }

  _processPayment(acctNumber, totalCost) {
    this._paymentService.makePayment(acctNumber, totalCost);
  }

  _processReservation(acctNumber, totalSeats) {
    this._reservationService.reserveSeat(acctNumber, totalSeats);
  }

  /**
   * At this point, some basic validation on our inputs has already taken
   * place, as we know that we have a valid account ID, and a list of valid
   * TicketTypeRequests.
   *
   * @param accountId - A valid account ID
   * @param ticketTypeRequests - A list of TicketTypeRequests
   * @throws InvalidPurchaseException - Thrown if there are business error
   * failures when processing the order.
   */
  purchaseTickets(accountId, ...ticketTypeRequests) {
    const simplifiedTicketMap = ticketTypeRequests.reduce(
      this._simplifyTickets,
      {
        ADULT: 0,
        CHILD: 0,
        INFANT: 0,
      },
    );

    this._validateOrder(simplifiedTicketMap);

    const totalTickets = this._calculateTotalTickets(simplifiedTicketMap);
    const orderTotal = this._calculateOrderCost(simplifiedTicketMap);
    const seatTotal = this._calculateTotalSeats(simplifiedTicketMap);

    this._processPayment(accountId, orderTotal);
    this._processReservation(accountId, seatTotal);

    return new TicketReservationResponse(totalTickets, orderTotal, seatTotal);
  }
}
