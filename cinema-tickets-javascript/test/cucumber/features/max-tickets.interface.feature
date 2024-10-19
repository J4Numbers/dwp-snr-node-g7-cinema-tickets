@interface-only
Feature: At most, 25 tickets can be bought during a single transaction. To prevent overbooking,
  there is a hard limit of the number of tickets that can be bought at once. At most, 25 tickets
  can be booked, and this number includes infant tickets.

  Scenario Outline: When I buy 25 tickets or fewer, then the transaction is successful
    Given I request <adultNumber> ADULT tickets
    And I request <childNumber> CHILD tickets
    And I request <infantNumber> INFANT tickets
    When a request to purchase tickets is made
    Then the receipt of the purchase should be returned
    And <totalNumber> seats should be reserved

    Examples:
      | adultNumber | childNumber | infantNumber | totalNumber |
      | 25          | 0           | 0            | 25          |
      | 20          | 3           | 2            | 25          |
      | 10          | 5           | 10           | 25          |
      | 1           | 24          | 0            | 25          |

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
