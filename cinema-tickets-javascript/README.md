# Cinema tickets

This application is a NodeJS project that exists as a stateless back-end service to purchase
tickets from a cinema. It offers an API which can be exercised for ticket purchase and reservation.

This service uses Express as a web service.

## How to run

To run the application locally, run the following command:

```bash
npm run start
```

## Requests

All requests require the following information:

* Account number for purchasing tickets
* A list of requested tickets

Successful responses will include the following:
* Number and type of tickets booked successfully
* Number of seats reserved
* Total amount paid

## Rules

The following rules apply for this application

- All purchases _must_ include at least 1 adult ticket
- The maximum number of infant tickets purchasable in a single transaction, is the number of adults
  who are buying a ticket. Only one infant can be sat on an adult's lap at once.
- A cumulative total of 25 tickets is the maximum limit in a single transaction.

## Testing

For a more in-depth look at the testing criteria and planned tests, visit [testing.README.md][1]

[1]: /cinema-tickets-javascript/testing.README.md
