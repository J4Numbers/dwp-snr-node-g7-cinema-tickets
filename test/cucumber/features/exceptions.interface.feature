@interface-only
Feature: Assuming this interface is used in the real world, then it is likely that there will
  always be some potential for bad data being presented to the interface. We need to ensure that
  this bad data is caught and appropriate feedback is given to the users in the presence of this
  bad data.

  Scenario Outline: When no tickets are requested - implicitly or explicitly - then an error
    should be presented requesting at least one ticket to be purchased.
    Given I explicitly request <number> <type> tickets
    When a request to purchase tickets is made
    Then an error for no tickets purchased should be thrown

    Examples:
      | number | type   |
      | 0      | ADULT  |
      | 0      | CHILD  |
      | 0      | INFANT |

  Scenario Outline: When invalid tickets are attempted, then an error giving information on what
    a valid ticket looks like should be provided.
    Given I request <number> <type> tickets
    When a request to purchase tickets is made
    Then an error that an invalid ticket was presented should be shown

    Examples:
      | number | type   |
      | -1     | CHILD  |
      | 1      | MONKEY |
      |        | CHILD  |
      | 1      |        |
