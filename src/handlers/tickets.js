export default ({
  C,
  logger,
  services
}) => async ({ req, res }) => {
  logger.log(`Request to ${C.routes.tickets.path}`)
  try {
    const result = services
      .ticketService
      .purchaseTickets({ accountId: 1, ticketsRequested: {} })
    logger.log(result)
    res
      .status(C.serverConfig.responseCodes.success)
      .send('Ticket purchase successful')
  } catch (error) {
    logger.error(error)
    res
      .status(C.serverConfig.responseCodes.error)
      .send('Internal application error')
  }
}
