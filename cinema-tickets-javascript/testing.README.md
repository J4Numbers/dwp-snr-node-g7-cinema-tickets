# Test plans

The cinema tickets application has a few test frameworks that are used to provide assurance of
correctness and resilience.

This project follows TDD and BDD practices, and the different scenarios have been laid out below
for the different tests.

## Testing criteria

The tests are split into different criteria according to the rules. These criteria may include more
than one test around negative conditions and edge cases.

### At least one adult ticket should always be bought

```gherkin
Feature: At least one adult ticket should always be bought
  
  Background: When buying tickets from the cinema, there is no possible combination where an adult
    does not buy a ticket. They will either be on their own, or accompanying a child or an infant.
    
  Scenario: When no tickets are bought, then an error should be displayed
    Given no tickets are being bought
    When a request to purchase tickets is made
    Then a 400 status exception should be presented
    And an error for no tickets purchased be shown

  Scenario Outline: When tickets are purchased without an adult, then an error for requiring at
    least one adult should be displayed.
    Given I request <number> <type> tickets
    When a request to purchase tickets is made
    Then a 400 status exception should be presented
    And an error for requiring at least 1 adult ticket should be shown
    
    Examples: 
      | number | type   |
      | 1      | child  |
      | 1      | infant |

  Scenario: When a ticket for an adult is bought, then the purchase should go through successfully 
    Given I request 1 adult ticket
    When a request to purchase tickets is made
    Then a 200 status should be presented
    And the receipt of the purchase should be returned

  Scenario: When a ticket for an adult is bought, I should be able to also buy child tickets
    Given I request 1 adult ticket
    And I request <number> <type> tickets
    When a request to purchase tickets is made
    Then a 200 status should be presented
    And the receipt of the purchase should be returned
```

### All infants should be accompanied by an adult

```gherkin
Feature: All infants should be accompanied by a dedicated caretaker adult

  Background: This is an assumption on the base requirements for this project. We state that one
    adult can only fit one infant on their lap at any one time while being able to look after them.
    If two infants are going to request a ticket, then there must be two adults looking after them.

  Scenario Outline: When there are fewer adults than infants, then an error requiring the minimum
    number of adults should be shown
    Given I request <adultNumber> adult tickets
    And I request <infantNumber> infant tickets
    When a request to purchase tickets is made
    Then a 400 status exception should be presented
    And an error for requiring at least <infantNumber> adult ticket should be shown

    Examples: 
      | adultNumber | infantNumber |
      | 1           | 2            |
      | 2           | 3            |
      | 1           | 5            |

  Scenario Outline: When there are more or equal numbers of adults to infants, then the tickets
    should be successfully booked, but with seat reservations only for the adults
    Given I request <adultNumber> adult tickets
    And I request <infantNumber> infant tickets
    When a request to purchase tickets is made
    Then a 200 status should be presented
    And the receipt of the purchase should be returned
    And <adultNumber> seats should be reserved

    Examples:
      | adultNumber | infantNumber |
      | 1           | 1            |
      | 2           | 2            |
      | 5           | 5            |
      | 5           | 1            |
```

### At most 25 tickets can be bought at one time

```gherkin
Feature: At most, 25 tickets can be bought during a single transaction

  Background: To prevent overbooking, there is a hard limit of the number of tickets that can be
    bought at once. At most, 25 tickets can be booked, and this number includes infant tickets.

  Scenario Outline: When I buy 25 tickets or fewer, then the transaction is successful
    Given I request <adultNumber> adult tickets
    And I request <childNumber> child tickets
    And I request <infantNumber> infant tickets
    When a request to purchase tickets is made
    Then a 200 status should be presented
    And the receipt of the purchase should be returned
    And <totalNumber> seats should be reserved

    Examples: 
      | adultNumber | childNumber | infantNumber | totalNumber |
      | 25          | 0           | 0            | 25          |
      | 20          | 3           | 2            | 25          |
      | 10          | 5           | 10           | 25          |
      | 1           | 24          | 0            | 25          |

  Scenario Outline: When I buy more than 25 tickets, then the transaction fails with a request to
    reduce the amount of tickets purchased 
    Given I request <adultNumber> adult tickets
    And I request <childNumber> child tickets
    And I request <infantNumber> infant tickets
    When a request to purchase tickets is made
    Then a 400 status exception should be presented
    And an error showing that <totalNumber> tickets is above the max of 25 should be shown

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
Feature: Non-compliant requests should be rejected from the cinema

  Background: The API for this service requests a number of data items. However, the user does not
    have to follow this request and can instead throw complete garbage at the API. This set of tests
    exists to highlight the different ways those can happen and to reject each and every one of
    them.

  Scenario Outline: Explicitly requesting 0 tickets is exactly the same as requesting no tickets,
    which is a failure as per criteria 1.
    Given I explicitly request <number> <type> tickets
    When a request to purchase tickets is made
    Then a 400 status exception should be presented
    And an error for no tickets purchased be shown

    Examples:
      | number | type   |
      | 0      | adult  |
      | 0      | child  |
      | 0      | infant |

  Scenario Outline: When presenting an invalid account code, the service should state that the account is
    invalid
    Given I request 1 adult ticket
    And my account code is <code>
    When a request to purchase tickets is made
    Then a 400 status exception should be presented
    And an error for an invalid account code is shown

    Examples:
      | code |
      | 0    |
      | -1   |
      | 0.5  |
      | hi   |
```
