# Cinema tickets

This application is a Node.js project that exists as a stateless back-end service to purchase
tickets from a cinema.

The task that this service has been created to fill can be found in [1][task.README.md]

[1]: task.README.md

## How to run

To run the application locally, run the following command:

```bash
npm run start
```

## Requests

All requests require the following information:

* Account number for purchasing tickets
* A list of requested tickets
  * Those tickets should contain a `count` field with the number of requested tickets
  * And a `type` field with the ticket type - which can be 'INFANT', 'CHILD', or 'ADULT'

Successful responses will include the following:
* Number of tickets booked successfully
* Number of seats reserved
* Total amount paid

## Rules

The following rules apply for this application

- All purchases _must_ include at least 1 adult ticket
- The maximum number of infant tickets purchasable in a single transaction, is the number of adults
  who are buying a ticket. Only one infant can be sat on an adult's lap at once.
- A cumulative total of 25 tickets is the maximum limit in a single transaction.

## Testing

For a more in-depth look at the testing criteria and planned tests, visit [testing.README.md][2]

[2]: testing.README.md

To run the tests within this repository, the following command can be used:

```bash
npm t
```
