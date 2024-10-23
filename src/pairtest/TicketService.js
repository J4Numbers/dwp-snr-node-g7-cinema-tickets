import TicketTypeRequest from "./lib/TicketTypeRequest.js";
import InvalidPurchaseException from "./lib/InvalidPurchaseException.js";
import TicketReservationResponse from "./lib/TicketReservationResponse.js";
import { TicketTypeMapping } from "./lib/TicketTypeMapping.js";

export default class TicketService {
  /**
   * Instantiation class to load in the payment and reservation services.
   *
   * @param paymentService {TicketPaymentService} - The payment service for managing
   * ticket payments.
   * @param reservationService {SeatReservationService} - The reservation service
   * for managing seat bookings.
   */
  constructor(paymentService, reservationService) {
    this._paymentService = paymentService;
    this._reservationService = reservationService;
  }

  /**
   * Return how many tickets we currently have on order of a given type.
   *
   * @private
   * @param ticketPurchaseMap {{[type: string]: number}} - The flatmap of all
   * tickets we currently have on order.
   * @param typeToTest {string} - The type we're testing the presence of in our
   * ticket purchase map.
   * @returns {number} The number of tickets we currently have on order for
   * that type. Defauts to 0.
   */
  _getTicketsOfType(ticketPurchaseMap, typeToTest) {
    let ticketsOfType = 0;
    if (Object.prototype.hasOwnProperty.call(ticketPurchaseMap, typeToTest)) {
      ticketsOfType = ticketPurchaseMap[typeToTest];
    }
    return ticketsOfType;
  }

  /**
   * Reduction method for collapsing a list of ticket type requests into a
   * flat map of the different types.
   *
   * @private
   * @param baseMap - The flattened map we're building up
   * @param ongoingTicket {TicketTypeRequest} - The next ticket we're adding to the flatmap
   * @returns The ongoing built up base flatmap
   */
  _simplifyTickets(baseMap, ongoingTicket) {
    if (
      !Object.prototype.hasOwnProperty.call(
        baseMap,
        ongoingTicket.getTicketType(),
      )
    ) {
      baseMap[ongoingTicket.getTicketType()] = 0;
    }
    baseMap[ongoingTicket.getTicketType()] += ongoingTicket.getNoOfTickets();
    return baseMap;
  }

  /**
   * Given an accountId from the user, confirm whether this is a valid accountId
   * for our use cases, and if not, throw an invalid purchase exception.
   *
   * @private
   * @param accountId {number} - A numeric account ID that we're validating.
   * @throws {InvalidPurchaseException} - Thrown if the provided account ID is
   * not a valid account ID (i.e. non-numeric, undefined, or not a positive
   * integer)
   */
  _validateAccountId(accountId) {
    if (
      accountId === undefined ||
      !Number.isInteger(accountId) ||
      accountId < 1
    ) {
      throw new InvalidPurchaseException(
        "Account ID must be a non-negative number above 0",
      );
    }
  }

  /**
   * Migrate the list of input tickets into their valid forms as per our data
   * definition (i.e. a list of {TicketTypeRequest}). Along the way, confirm
   * that all input tickets are valid.
   *
   * @private
   * @param ticketPurchaseList {Array} The list of tickets input to the
   * interface, no matter what they might contain.
   * @returns {TicketTypeRequest[]} The list of discovered tickets that
   * we can feed into the rest of the interface.
   * @throws {InvalidPurchaseException} - Thrown if any of the provided tickets
   * are not valid when being converted into TicketTypeRequests.
   */
  _migrateTicketList(ticketPurchaseList) {
    if (!Array.isArray(ticketPurchaseList)) {
      throw new InvalidPurchaseException(
        "Tickets list must be an array of 1 or more elements",
      );
    }

    return ticketPurchaseList.map((ticketRequest) => {
      if (
        ticketRequest === undefined ||
        ticketRequest.count === undefined ||
        !Number.isInteger(ticketRequest.count) ||
        ticketRequest.count < 1
      ) {
        throw new InvalidPurchaseException(
          "Invalid ticket request found. count must be a number greater than 0",
        );
      }
      try {
        return new TicketTypeRequest(ticketRequest.type, ticketRequest.count);
      } catch (e) {
        throw new InvalidPurchaseException(
          `Invalid ticket request found. ${e.message}`,
        );
      }
    });
  }

  /**
   * Validate the number of requested tickets is not either 0 or above the
   * maximum number of tickets we're allowed (25 by default).
   *
   * @private
   * @param ticketPurchaseMap - The flattened map of all requested tickets
   * @throws InvalidPurchaseException - Thrown if there are 0 or > 25
   * requested tickets
   */
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

  /**
   * Validate the number of adults present in the order. 1 adult is always
   * required, no matter what, but if infants are present, then additional
   * adults may be required.
   *
   * @private
   * @param ticketPurchaseMap - The flattened map of all requested tickets
   * @throws InvalidPurchaseException - Thrown if there are not enough adults
   * to supervise the children and infants in the reservation
   */
  _validateRequiredAdults(ticketPurchaseMap) {
    let infantTickets = this._getTicketsOfType(ticketPurchaseMap, "INFANT");
    let adultsRequired = infantTickets > 0 ? infantTickets : 1;

    if (this._getTicketsOfType(ticketPurchaseMap, "ADULT") < adultsRequired) {
      throw new InvalidPurchaseException(
        `At least ${adultsRequired} adult ticket(s) are required for this transaction`,
      );
    }
  }

  /**
   * Validate the tickets that have been requested. This validation is more
   * in line with business rules rather than general exception checking.
   *
   * @private
   * @param accountId {number} - The account number requested for action.
   * @param ticketPurchaseList {Array} - The list of all requested tickets
   * @returns {Object} - A flattened map of all requested tickets
   * @throws InvalidPurchaseException - Thrown if a validation error is found
   * in our searching
   */
  _validateOrder(accountId, ticketPurchaseList) {
    this._validateAccountId(accountId);
    const convertedTickets = this._migrateTicketList(ticketPurchaseList);

    const ticketPurchaseMap = convertedTickets.reduce(
      this._simplifyTickets,
      {},
    );

    this._validateTicketCount(ticketPurchaseMap);
    this._validateRequiredAdults(ticketPurchaseMap);

    return ticketPurchaseMap;
  }

  /**
   * Calculate the total number of tickets requested from the ticket service.
   *
   * @private
   * @param ticketPurchaseMap - The flattened map of all requested tickets
   * @returns {number} The number of tickets that are being requested in this
   * transaction
   */
  _calculateTotalTickets(ticketPurchaseMap) {
    return Object.values(ticketPurchaseMap).reduce(
      (ongoingTotal, newPurchases) => ongoingTotal + newPurchases,
      0,
    );
  }

  /**
   * Calculate the total cost of all the requested tickets.
   *
   * @private
   * @param ticketPurchaseMap - The flattened map of all requested tickets
   * @returns {number} The total order cost of all requested tickets
   */
  _calculateOrderCost(ticketPurchaseMap) {
    return Object.keys(ticketPurchaseMap).reduce((totalCost, ticketType) => {
      return (
        totalCost +
        ticketPurchaseMap[ticketType] * TicketTypeMapping[ticketType]
      );
    }, 0);
  }

  /**
   * Calculate the total number of seats to be reserved as part of this
   * transaction.
   *
   * @private
   * @param ticketPurchaseMap - The flattened map of all requested tickets
   * @returns {number} The total number of seats requesting reservation within
   * this transaction
   */
  _calculateTotalSeats(ticketPurchaseMap) {
    return (
      this._getTicketsOfType(ticketPurchaseMap, "ADULT") +
      this._getTicketsOfType(ticketPurchaseMap, "CHILD")
    );
  }

  /**
   * Construct a ticket reservation response which details the number of
   * tickets ordered, the seats reserved, and the total cost of the
   * transaction.
   *
   * @private
   * @param ticketPurchaseMap - The flattened map of all requested tickets
   * @returns {TicketReservationResponse} The reservation response details that
   * can be used as a receipt.
   */
  _generateTicketReservationResponse(ticketPurchaseMap) {
    const totalTickets = this._calculateTotalTickets(ticketPurchaseMap);
    const orderTotal = this._calculateOrderCost(ticketPurchaseMap);
    const seatTotal = this._calculateTotalSeats(ticketPurchaseMap);

    return new TicketReservationResponse(totalTickets, orderTotal, seatTotal);
  }

  /**
   * Pass the account number and total cost on to our payment services for
   * requesting payment from the user.
   *
   * @private
   * @param accountId {number} - The account number we're looking to charge
   * @param totalCost {number} - The total cost (in £) that we're charging
   */
  _processPayment(accountId, totalCost) {
    this._paymentService.makePayment(accountId, totalCost);
  }

  /**
   * Pass the account number and seats requested to our seat reservation
   * services to ensure that the transaction is booked in.
   *
   * @private
   * @param accountId {number} - The account number that will own the reserved
   * seats
   * @param totalSeats {number} - The requested number of reserved seats
   */
  _processReservation(accountId, totalSeats) {
    this._reservationService.reserveSeat(accountId, totalSeats);
  }

  /**
   * Interface for providing two or more data items in order to book a number
   * of tickets at a cinema.
   *
   * @param accountId {number} - An account ID to link against the transactions.
   * @param ticketTypeRequests {Object} - A list of objects that should
   * adhere to a TicketTypeRequest.
   * @returns {TicketReservationResponse} The receipt for the reservation as
   * requested by the user
   * @throws InvalidPurchaseException - Thrown if there are business error
   * failures when processing the order.
   */
  purchaseTickets(accountId, ...ticketTypeRequests) {
    const simplifiedTicketMap = this._validateOrder(
      accountId,
      ticketTypeRequests,
    );

    const ticketReservation =
      this._generateTicketReservationResponse(simplifiedTicketMap);

    this._processPayment(accountId, ticketReservation.getTotalCost());
    this._processReservation(accountId, ticketReservation.getSeatsReserved());

    return ticketReservation;
  }
}
