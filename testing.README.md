# Test plans

The cinema tickets application has a few test frameworks that are used to provide assurance of
correctness and resilience.

This project follows TDD and BDD practices, and the different scenarios have been laid out below
for the different tests.

## Unit tests

The unit tests are written under the mocha framework, with c8 as a coverage tool. They can be run
with:

```bash
npm run test:unit # For the main unit tests
npm run cover     # For coverage checks
```

## Behaviour testing criteria

The tests are split into different criteria according to the rules. These criteria may include more
than one test around negative conditions and edge cases.

These tests are written in gherkin and operated using Cucumber. They can be run with the following
command:

```bash
npm run test:interface
```

### At least one adult ticket should always be bought

```gherkin
Feature: At least one adult ticket should always be bought. When buying tickets from the cinema,
  there is no possible combination where an adult does not buy a ticket. They will either be on
  their own, or accompanying a child or an infant.

  Scenario: When no tickets are bought, then an error should be displayed
    Given no tickets are being bought
    When a request to purchase tickets is made
    Then an error for no tickets purchased should be thrown

  Scenario Outline: When tickets are purchased without an adult, then an error for requiring at
  least one adult should be displayed.
    Given I request <number> <type> tickets
    When a request to purchase tickets is made
    Then an error for requiring at least 1 adult ticket should be thrown

    Examples:
      | number | type   |
      | 1      | CHILD  |
      | 1      | INFANT |

  Scenario: When a ticket for an adult is bought, then the purchase should go through successfully
    Given I request 1 ADULT ticket
    When a request to purchase tickets is made
    Then the receipt of the purchase should be returned
    And 1 ticket should have been ordered
    And the order total should have equalled 25
    And 1 seat should be reserved

  Scenario Outline: When a ticket for an adult is bought, I should be able to also buy child tickets
    Given I request 1 ADULT ticket
    And I request <number> CHILD tickets
    When a request to purchase tickets is made
    Then the receipt of the purchase should be returned
    And <totalTickets> tickets should have been ordered
    And the order total should have equalled <totalCost>
    And <totalSeats> seats should be reserved

    Examples:
      | number | totalTickets | totalCost | totalSeats |
      | 1      | 2            | 40        | 2          |
      | 5      | 6            | 100       | 6          |
```

### All infants should be accompanied by an adult

```gherkin
Feature: All infants should be accompanied by a dedicated caretaker adult. This is an assumption
  on the base requirements for this project. We state that one adult can only fit one infant on
  their lap at any one time while being able to look after them. If two infants are going to
  request a ticket, then there must be two adults looking after them.

  Scenario Outline: When there are fewer adults than infants, then an error requiring the minimum
  number of adults should be shown
    Given I request <adultNumber> ADULT tickets
    And I request <infantNumber> INFANT tickets
    When a request to purchase tickets is made
    Then an error for requiring at least <infantNumber> adult tickets should be thrown

    Examples:
      | adultNumber | infantNumber |
      | 1           | 2            |
      | 2           | 3            |
      | 1           | 5            |

  Scenario Outline: When there are more or equal numbers of adults to infants, then the tickets
  should be successfully booked, but with seat reservations only for the adults
    Given I request <adultNumber> ADULT tickets
    And I request <infantNumber> INFANT tickets
    When a request to purchase tickets is made
    Then the receipt of the purchase should be returned
    And <totalNumber> tickets should have been ordered
    And the order total should have equalled <totalCost>
    And <adultNumber> seats should be reserved

    Examples:
      | adultNumber | infantNumber | totalNumber | totalCost |
      | 1           | 1            | 2           | 25        |
      | 2           | 2            | 4           | 50        |
      | 5           | 5            | 10          | 125       |
      | 5           | 1            | 6           | 125       |
```

### At most 25 tickets can be bought at one time

```gherkin
Feature: At most, 25 tickets can be bought during a single transaction. To prevent overbooking,
  there is a hard limit of the number of tickets that can be bought at once. At most, 25 tickets
  can be booked, and this number includes infant tickets.

  Scenario Outline: When I buy 25 tickets or fewer, then the transaction is successful
    Given I request <adultNumber> ADULT tickets
    And I request <childNumber> CHILD tickets
    And I request <infantNumber> INFANT tickets
    When a request to purchase tickets is made
    Then the receipt of the purchase should be returned
    And <totalNumber> tickets should have been ordered
    And the order total should have equalled <totalCost>
    And <totalSeats> seats should be reserved

    Examples:
      | adultNumber | childNumber | infantNumber | totalNumber | totalCost | totalSeats |
      | 25          | 0           | 0            | 25          | 625       | 25         |
      | 20          | 3           | 2            | 25          | 545       | 23         |
      | 10          | 5           | 10           | 25          | 325       | 15         |
      | 1           | 24          | 0            | 25          | 385       | 25         |

  Scenario Outline: When I buy more than 25 tickets, then the transaction fails with a request to
  reduce the amount of tickets purchased
    Given I request <adultNumber> ADULT tickets
    And I request <childNumber> CHILD tickets
    And I request <infantNumber> INFANT tickets
    When a request to purchase tickets is made
    Then an error showing that <totalNumber> tickets is above the max of 25 should be thrown

    Examples:
      | adultNumber | childNumber | infantNumber | totalNumber |
      | 26          | 0           | 0            | 26          |
      | 10          | 5           | 11           | 26          |
      | 26          | 24          | 0            | 26          |
      | 100         | 100         | 100          | 300         |
```

### Exceptional circumstances

The above scenarios go into the main business criteria for the application, but do not detail
what some of the edge cases are which should always result in a failure.

```gherkin
Feature: Assuming this interface is used in the real world, then it is likely that there will
  always be some potential for bad data being presented to the interface. We need to ensure that
  this bad data is caught and appropriate feedback is given to the users in the presence of this
  bad data.

  Scenario Outline: When no tickets are requested - implicitly or explicitly - then an error
  should be presented requesting at least one ticket to be purchased.
    Given I explicitly request <number> <type> tickets
    When a request to purchase tickets is made
    Then an error that an invalid ticket was presented should be shown with the detail of <errorDetail>

    Examples:
      | number | type   | errorDetail                           |
      | 0      | ADULT  | count must be a number greater than 0 |
      | 0      | CHILD  | count must be a number greater than 0 |
      | 0      | INFANT | count must be a number greater than 0 |

  Scenario Outline: When invalid tickets are attempted, then an error giving information on what
  a valid ticket looks like should be provided.
    Given I explicitly request <number> <type> tickets
    When a request to purchase tickets is made
    Then an error that an invalid ticket was presented should be shown with the detail of <errorDetail>

    Examples:
      | number | type   | errorDetail                           |
      | -1     | CHILD  | count must be a number greater than 0 |
      | 1      | MONKEY | type must be ADULT, CHILD, or INFANT  |

  Scenario Outline: When presenting an invalid account code, the service should state that the account is
  invalid
    Given I request 1 ADULT ticket
    And my account id is <code>
    When a request to purchase tickets is made
    Then an error that an invalid account id was presented should be shown

    Examples:
      | code |
      | 0    |
      | -1   |
      | 0.5  |
      | hi   |
```
