package uk.gov.dwp.uc.pairtest;

import thirdparty.paymentgateway.TicketPaymentService;
import uk.gov.dwp.uc.pairtest.domain.TicketTypeRequest;
import uk.gov.dwp.uc.pairtest.domain.TicketTypeRequest.Type;
import uk.gov.dwp.uc.pairtest.exception.InvalidPurchaseException;

public class TicketServiceImpl implements TicketService {
    private TicketPaymentService ticketPaymentService;

    private final int ADULT_TICKET_PRICE = 20;
    private final int CHILD_TICKET_PRICE = 10;
    private final int INFANT_TICKET_PRICE = 0;

    public TicketServiceImpl(TicketPaymentService ticketPaymentService) {
        this.ticketPaymentService = ticketPaymentService;
    }

    @Override
    public void purchaseTickets(Long accountId, TicketTypeRequest... ticketTypeRequests) throws InvalidPurchaseException {
        int numberOfAdultTickets = 0;
        int numberOfChildTickets = 0;
        int numberOfInfantTickets = 0;

        for (TicketTypeRequest ticketTypeRequest : ticketTypeRequests) {
            switch (ticketTypeRequest.getTicketType()) {
                case ADULT -> numberOfAdultTickets += ticketTypeRequest.getNoOfTickets();
                case CHILD -> numberOfChildTickets += ticketTypeRequest.getNoOfTickets();
                case INFANT -> numberOfInfantTickets += ticketTypeRequest.getNoOfTickets();
            }
        }

        if ((numberOfChildTickets > 0 || numberOfInfantTickets > 0) && numberOfAdultTickets == 0) {
            throw new InvalidPurchaseException("ERROR: At least one adult ticket is required when purchasing a child/infant ticket");
        }

        int totalPaymentAmount =
            (numberOfAdultTickets * ADULT_TICKET_PRICE) +
                (numberOfChildTickets * CHILD_TICKET_PRICE) +
                (numberOfInfantTickets * INFANT_TICKET_PRICE);

        ticketPaymentService.makePayment(accountId, totalPaymentAmount);
    }
}
