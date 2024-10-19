@interface-only
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
    And <adultNumber> seats should be reserved

    Examples:
      | adultNumber | infantNumber |
      | 1           | 1            |
      | 2           | 2            |
      | 5           | 5            |
      | 5           | 1            |
