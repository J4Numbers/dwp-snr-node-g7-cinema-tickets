import { TicketTypeMapping } from "./TicketTypeMapping.js";

/**
 * Immutable Object.
 */

export default class TicketTypeRequest {
  #type;

  #noOfTickets;

  constructor(type, noOfTickets) {
    if (!Object.keys(TicketTypeMapping).includes(type)) {
      throw new TypeError(
        `type must be ${Object.keys(TicketTypeMapping).slice(0, -1).join(", ")}, or ${Object.keys(TicketTypeMapping).slice(-1)}`,
      );
    }

    if (!Number.isInteger(noOfTickets)) {
      throw new TypeError("noOfTickets must be an integer");
    }

    this.#type = type;
    this.#noOfTickets = noOfTickets;
  }

  getNoOfTickets() {
    return this.#noOfTickets;
  }

  getTicketType() {
    return this.#type;
  }
}
