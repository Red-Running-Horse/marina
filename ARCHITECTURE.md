# Marina Wallet Architecture

This document describes the architecture and design patterns used in the Marina Liquid Network wallet browser extension.

## Table of Contents

1. [Overview](#overview)
2. [Architecture Layers](#architecture-layers)
3. [Directory Structure](#directory-structure)
4. [Key Design Patterns](#key-design-patterns)
5. [Data Flow](#data-flow)
6. [Extension Architecture](#extension-architecture)
7. [Cryptographic Operations](#cryptographic-operations)
8. [Testing Strategy](#testing-strategy)

## Overview

Marina is a browser extension wallet for the Liquid Network, built using:

- **React 18** for the user interface
- **TypeScript 4.3** for type safety
- **Webpack 5** for bundling
- **Tailwind CSS** for styling

The codebase follows **Clean Architecture** principles with clear separation between domain logic, application use cases, infrastructure, and UI layers.

## Architecture Layers

### 1. Domain Layer (`src/domain/`)

The core business logic layer that defines:
- **Entities**: Core domain models (Transaction, PSET, Asset, Account)
- **Interfaces**: Repository abstractions, encryption protocols
- **Value Objects**: Immutable objects representing domain concepts

**Key Files:**
- `repository.ts` - Repository interface definitions (347 lines)
- `pset.ts` - Partially Signed Elements Transaction builder (657 lines)
- `transaction.ts` - Transaction domain model
- `encryption.ts` - Encryption/decryption interfaces
- `message.ts` - Message signing/verification

**Design Principle**: No dependencies on external libraries or frameworks. Pure TypeScript with domain-specific logic only.

### 2. Application Layer (`src/application/`)

Orchestrates business logic through use cases:
- **Account management**: Account creation, restoration, key derivation
- **Transaction operations**: Signing, blinding, unblinding, broadcasting
- **State updates**: Portfolio updates, balance calculation

**Key Files:**
- `account.ts` - Account factory and key derivation (552 lines)
- `signer.ts` - Transaction signing service
- `blinder.ts` - Confidential transaction blinding
- `unblinder.ts` - Confidential transaction unblinding
- `updater.ts` - Wallet state updater (369 lines)
- `presenter.ts` - Data presentation/formatting (326 lines)

**Design Principle**: Coordinates domain objects and infrastructure services. Contains no UI or storage implementation details.

### 3. Infrastructure Layer (`src/infrastructure/`)

Implements technical capabilities:
- **Storage**: Browser extension storage adapters
- **Logging**: Centralized logging with Sentry integration
- **Data conversion**: Browser storage serialization/deserialization

**Key Files:**
- `storage/wallet-repository.ts` - Wallet storage implementation
- `storage/asset-repository.ts` - Asset registry storage
- `storage/app-repository.ts` - Application settings storage
- `browser-storage-converters.ts` - Custom JSON converters for Buffer/Map
- `logger.ts` - Centralized logging infrastructure

**Design Principle**: All external dependencies (browser APIs, storage, network) live here. Implements interfaces defined in the domain layer.

### 4. UI Layer (`src/extension/`)

React-based user interface:
- **85+ React components** organized by feature
- Context providers for dependency injection
- React Router for navigation

**Key Directories:**
- `components/` - Reusable UI components (buttons, inputs, modals)
- `wallet/` - Main wallet views (send, receive, transactions, settings)
- `onboarding/` - Wallet creation and restoration flows
- `settings/` - Configuration and preferences
- `popups/` - Connect/disconnect prompts for dApps
- `utility/` - Taxi submarine swaps
- `context/` - React contexts for DI (StorageContext, BackgroundPortContext)
- `routes/` - Route definitions and navigation

## Directory Structure

```
src/
├── application/        # Use cases and business logic orchestration
├── background/        # Extension background service worker
├── content/           # Content script (DOM bridge)
├── domain/            # Core business logic (entities, repositories)
├── ecclib.ts         # WASM cryptographic library loader
├── extension/         # React UI components and views
├── infrastructure/    # Storage, logging, external integrations
├── inject/            # Injected provider script (window.marina API)
├── pkg/              # Third-party integrations (Boltz swaps)
└── port/             # Inter-process communication (IPC)
```

## Key Design Patterns

### 1. Repository Pattern

**Purpose**: Abstract data access to allow swapping implementations.

```typescript
// Domain interface (no implementation details)
export interface WalletRepository {
  getAccountDetails(accountName: string): Promise<AccountDetails>;
  updateWallet(updates: WalletUpdate): Promise<void>;
}

// Infrastructure implementation
export class BrowserStorageWalletRepository implements WalletRepository {
  constructor(private browserStorage: Browser.storage.StorageArea) {}
  
  async getAccountDetails(accountName: string): Promise<AccountDetails> {
    // Browser-specific storage access
  }
}
```

**Benefits**:
- Domain logic doesn't depend on browser APIs
- Easy to test with mock repositories
- Can swap storage backends (IndexedDB, cloud, etc.)

### 2. Dependency Injection via React Context

**Purpose**: Provide dependencies to components without prop drilling.

```typescript
// Context provider
export const StorageContext = React.createContext<{
  walletRepository: WalletRepository;
  appRepository: AppRepository;
}>(null!);

// Usage in component
const { walletRepository } = useContext(StorageContext);
```

**Benefits**:
- Components remain testable (inject mock contexts)
- Centralized dependency management
- Type-safe dependency resolution

### 3. Builder Pattern (PSET)

**Purpose**: Construct complex Partially Signed Elements Transactions.

```typescript
const pset = new PsetBuilder()
  .addInput(utxo)
  .addOutput({ asset, value, address })
  .blindOutputs(blindingPrivateKeys)
  .signInputs(signingKeys)
  .finalize();
```

**Benefits**:
- Fluent API for transaction construction
- Step-by-step validation
- Encapsulates complex blinding/signing logic

### 4. Message Passing (Port Communication)

**Purpose**: Communicate between extension contexts (popup ↔ background).

```typescript
// Background port
backgroundPort.onMessage.addListener((message) => {
  if (message.type === 'SIGN_TRANSACTION') {
    // Handle signing request
  }
});

// Popup sends message
backgroundPort.sendMessage({
  type: 'SIGN_TRANSACTION',
  payload: { pset, accountName }
});
```

**Benefits**:
- Isolated extension contexts can communicate
- Type-safe message protocols
- Event-driven architecture

## Data Flow

### Transaction Signing Flow

```
UI (Send Form)
  ↓ User clicks "Send"
  ↓
Background Port (IPC)
  ↓ Forward signing request
  ↓
Application Layer (Signer)
  ↓ 1. Build PSET with PsetBuilder
  ↓ 2. Blind outputs (Blinder service)
  ↓ 3. Sign inputs with keys
  ↓
Infrastructure (WalletRepository)
  ↓ Retrieve signing keys from storage
  ↓
Domain (PSET)
  ↓ Core cryptographic operations (secp256k1-zkp)
  ↓
Background Port (IPC)
  ↓ Return signed transaction
  ↓
UI (Transaction Sent)
  ✓ Show success message
```

### State Update Flow

```
Background Worker (Updater)
  ↓ Poll Electrum server every 30s
  ↓
Application Layer (Updater)
  ↓ Fetch new transactions
  ↓ Unblind confidential outputs
  ↓ Calculate new balances
  ↓
Infrastructure (WalletRepository)
  ↓ Persist updated wallet state
  ↓
UI (Portfolio View)
  ↓ Subscribe to storage changes
  ↓
React Components Re-render
  ✓ Display updated balances
```

## Extension Architecture

Marina uses the browser extension model with three main contexts:

### 1. Background Script (`src/background/`)

- **Persistent service worker** (Manifest V2) or **event page** (V3)
- Manages wallet state and cryptographic operations
- Connects to Electrum servers via WebSocket
- Handles IPC with popup and content scripts

**Key Responsibilities**:
- Transaction signing
- Balance updates
- Network communication
- State persistence

### 2. Content Script (`src/content/`)

- **Injected into web pages** by the browser
- Acts as a **bridge** between inject script and background
- Forwards messages using `window.postMessage`

**Security**: Isolated from web page JavaScript (cannot access page variables).

### 3. Inject Script (`src/inject/`)

- **Injected directly into page context** (shares window object)
- Exposes `window.marina` provider API to dApps
- Uses `window.postMessage` to communicate with content script

**API Exposed**:
```typescript
window.marina = {
  enable(): Promise<void>;
  getAddresses(): Promise<Address[]>;
  signTransaction(pset: string): Promise<string>;
  // ... more methods
};
```

### 4. Popup UI (`src/extension/`)

- React application loaded in extension popup
- Uses `browser.runtime.sendMessage` for background IPC
- Renders wallet views, settings, onboarding flows

## Cryptographic Operations

Marina implements Liquid Network confidential transactions:

### Key Derivation (BIP32/BIP39)

```typescript
// Mnemonic → Seed
const seed = bip39.mnemonicToSeedSync(mnemonic);

// HD Wallet derivation: m/84'/1776'/0'/0/index
const masterNode = bip32.fromSeed(seed);
const accountNode = masterNode.derivePath("m/84'/1776'/0'");
const addressNode = accountNode.derive(0).derive(index);

// Extract keys
const publicKey = addressNode.publicKey;
const privateKey = addressNode.privateKey;
```

### Blinding (Confidential Assets/Amounts)

```typescript
// Derive blinding key (SLIP77)
const masterBlindingKey = slip77.fromMasterBlindingKey(seed);
const outputBlindingKey = masterBlindingKey.derive(scriptPubKey);

// Blind output
const { nonce, rangeProof, surjectionProof } = blindOutput({
  asset,
  value,
  blindingKey: outputBlindingKey,
});
```

**Libraries Used**:
- `@vulpemventures/secp256k1-zkp` - Zero-knowledge proofs
- `liquidjs-lib` - Liquid transaction construction
- `slip77` - Blinding key derivation

### Message Signing

```typescript
import { sign } from 'bitcoinjs-message';

const signature = sign(
  message,
  privateKey,
  signingKeyPair.compressed,
  { extraEntropy: randomBytes(32) }
);
```

## Testing Strategy

### Current State
- **Unit tests**: 5 test files, 889 LOC
- **E2E tests**: Playwright browser automation
- **Coverage**: ~5.7% (needs improvement to 70%+)

### Recommended Testing Approach

1. **Domain Layer**: Pure unit tests (no mocks needed)
   ```typescript
   describe('PsetBuilder', () => {
     it('builds valid PSET with inputs and outputs', () => {
       const pset = new PsetBuilder()
         .addInput(mockUtxo)
         .addOutput(mockOutput)
         .build();
       
       expect(pset.inputs).toHaveLength(1);
       expect(pset.outputs).toHaveLength(1);
     });
   });
   ```

2. **Application Layer**: Mock repositories
   ```typescript
   const mockWalletRepo: WalletRepository = {
     getAccountDetails: jest.fn().mockResolvedValue(mockAccount),
   };
   
   const signer = new Signer(mockWalletRepo);
   ```

3. **UI Layer**: React Testing Library
   ```typescript
   render(
     <StorageContext.Provider value={mockStorage}>
       <SendView />
     </StorageContext.Provider>
   );
   
   fireEvent.click(screen.getByText('Send'));
   expect(screen.getByText('Transaction Sent')).toBeInTheDocument();
   ```

4. **E2E Tests**: Playwright (already in place)
   - Test critical user flows end-to-end
   - Wallet creation, send/receive, settings

## Best Practices

### Do's ✅

1. **Use TypeScript strict mode** - Catch errors at compile time
2. **Import from domain layer only** - Keep dependencies unidirectional
3. **Inject dependencies via constructors** - Easier testing
4. **Use error boundaries** - Graceful error handling in UI
5. **Log with centralized logger** - Structured logging with Sentry
6. **Validate all user inputs** - Use Yup schemas with Formik
7. **Keep files focused** - Single Responsibility Principle

### Don'ts ❌

1. **Don't use `any` type** - Prefer specific types or generics
2. **Don't import infrastructure in domain** - Violates clean architecture
3. **Don't use `console.*` directly** - Use logger instead
4. **Don't disable ESLint rules** - Fix the underlying issue
5. **Don't store secrets unencrypted** - Always encrypt with scrypt
6. **Don't trust web page input** - Validate all external data

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup, code style guidelines, and how to submit changes.

## Resources

- [Liquid Network Documentation](https://docs.liquid.net/)
- [Elements Protocol Specification](https://elementsproject.org/elements-code-tutorial/overview)
- [BIP32: Hierarchical Deterministic Wallets](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki)
- [SLIP77: Deterministic Blinding Key Derivation](https://github.com/satoshilabs/slips/blob/master/slip-0077.md)
- [Marina Provider API](https://docs.vulpem.com/marina/provider-api)
