@interface-only
Feature: At least one adult ticket should always be bought. When buying tickets from the cinema,
  there is no possible combination where an adult does not buy a ticket. They will either be on
  their own, or accompanying a child or an infant.

  Background:

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
