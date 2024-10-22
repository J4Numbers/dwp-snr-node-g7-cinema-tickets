/**
 * Immutable Object.
 */

export default class TicketReservationResponse {
  #ticketsOrdered;
  #totalCost;
  #seatsReserved;

  constructor(ticketsOrdered, totalCost, seatsReserved) {
    if (!Number.isInteger(ticketsOrdered)) {
      throw new TypeError("ticketsOrdered must be an integer");
    }
    if (!Number.isInteger(totalCost)) {
      throw new TypeError("totalCost must be an integer");
    }
    if (!Number.isInteger(seatsReserved)) {
      throw new TypeError("seatsReserved must be an integer");
    }

    this.#ticketsOrdered = ticketsOrdered;
    this.#totalCost = totalCost;
    this.#seatsReserved = seatsReserved;
  }

  getTicketsOrdered() {
    return this.#ticketsOrdered;
  }

  getTotalCost() {
    return this.#totalCost;
  }

  getSeatsReserved() {
    return this.#seatsReserved;
  }
}
