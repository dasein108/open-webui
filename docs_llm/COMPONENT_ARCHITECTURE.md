# Cyberlink Component Architecture

## Component Diagram

```mermaid
classDiagram
    class CyberlinkContent {
        +string? from
        +string? to
        +string type
        +string? value
    }

    class CyberlinkMessage {
        +string id
        +string type
        +CyberlinkContent[] content
        +number timestamp
    }

    class CyberlinkState {
        +string status
        +CyberlinkMessage message
        +string? transactionHash
    }

    class CyberlinkStore {
        -Record~string,CyberlinkState~ cyberlinks
        +subscribe()
        +addCyberlink(message)
        +updateStatus(id, status, hash)
        +getCyberlink(id)
    }

    class CyberlinkHandler {
        +handleToolResponse(response)
        +handleSign(messageId)
        +handleReject(messageId)
    }

    class CyberlinkMessage {
        +string messageId
        +function onSign
        +function onReject
        +render()
    }

    CyberlinkContent --* CyberlinkMessage
    CyberlinkMessage --* CyberlinkState
    CyberlinkState --* CyberlinkStore
    CyberlinkStore --> CyberlinkHandler
    CyberlinkStore --> CyberlinkMessage
    CyberlinkHandler --> CyberlinkStore

```

## Data Flow

```mermaid
flowchart TD
    A[LLM Tool Call] --> B[CyberlinkHandler]
    B --> |Create Message| C[CyberlinkStore]
    C --> |State Update| D[UI Component]
    D --> |User Action| E{Action Type}
    E --> |Sign| F[Wallet Integration]
    E --> |Reject| G[Update Store]
    F --> |Transaction Result| G
    G --> |State Change| D
```

## Component Responsibilities

### Data Layer

- **CyberlinkContent**: Base data structure for links
- **CyberlinkMessage**: Message wrapper with metadata
- **CyberlinkState**: Transaction state container

### State Management

- **CyberlinkStore**: Central state manager
  - Maintains transaction records
  - Provides reactive state updates
  - Handles state persistence

### Business Logic

- **CyberlinkHandler**: Transaction processor
  - Processes LLM responses
  - Manages transaction lifecycle
  - Coordinates with wallet

### UI Layer

- **CyberlinkMessage Component**: User interface
  - Displays transaction details
  - Handles user interactions
  - Shows transaction status

## Communication Flow

1. **LLM to Handler**

   ```typescript
   // Tool response processing
   handler.handleToolResponse(toolResponse);
   ```

2. **Handler to Store**

   ```typescript
   // State updates
   store.addCyberlink(message);
   store.updateStatus(id, status);
   ```

3. **Store to UI**

   ```typescript
   // Reactive updates
   $: cyberlink = $cyberlinkStore[messageId];
   ```

4. **UI to Handler**
   ```typescript
   // User actions
   onSign(messageId);
   onReject(messageId);
   ```

## State Updates

```mermaid
stateDiagram-v2
    state "Store Updates" as SU {
        [*] --> Pending
        Pending --> Signing
        Signing --> Signed
        Signing --> Rejected
        Pending --> Rejected
    }

    state "UI Updates" as UI {
        [*] --> ShowButtons
        ShowButtons --> ShowSpinner
        ShowSpinner --> ShowSuccess
        ShowSpinner --> ShowError
    }

    SU --> UI: Triggers
```

This architecture ensures:

- Clear separation of concerns
- Type-safe data flow
- Reactive UI updates
- Consistent state management
- Error boundary containment
