# Contributing to Marina Wallet

Thank you for your interest in contributing to Marina! This guide will help you get started.

## Table of Contents

1. [Development Setup](#development-setup)
2. [Code Style Guidelines](#code-style-guidelines)
3. [Testing Requirements](#testing-requirements)
4. [Submitting Changes](#submitting-changes)
5. [Release Process](#release-process)

## Development Setup

### Prerequisites

- **Node.js**: v16+ (check with `node --version`)
- **Yarn**: v1.22+ (check with `yarn --version`)
- **Chrome/Chromium**: For testing the extension

### Initial Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/vulpemventures/marina.git
   cd marina
   ```

2. **Install dependencies**:
   ```bash
   yarn install
   ```

3. **Start development server**:
   ```bash
   # For Manifest V2 (Firefox, older Chrome)
   yarn start
   
   # For Manifest V3 (Chrome 88+, Edge 88+)
   yarn start:v3
   ```

4. **Load extension in browser**:
   - **Chrome**: Go to `chrome://extensions/`, enable "Developer mode", click "Load unpacked", select `dist/v3` directory
   - **Firefox**: Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", select any file in `dist/v2` directory

### Development Workflow

The development server runs in **watch mode** with Hot Module Reloading (HMR) for Chrome-based browsers:

1. Make code changes in `src/`
2. Webpack automatically rebuilds
3. **Chrome**: Changes apply immediately (HMR)
4. **Firefox**: Click reload button in `about:debugging`

## Code Style Guidelines

### TypeScript

✅ **Do**:
```typescript
// Use specific types instead of 'any'
interface TransactionDetails {
  txid: string;
  amount: number;
  asset: string;
}

// Use async/await for promises
async function fetchBalance(address: string): Promise<number> {
  const response = await electrumClient.getBalance(address);
  return response.confirmed + response.unconfirmed;
}

// Use optional chaining and nullish coalescing
const balance = user?.wallet?.balance ?? 0;

// Use discriminated unions for state
type RequestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Transaction }
  | { status: 'error'; error: Error };
```

❌ **Don't**:
```typescript
// Don't use 'any' type
function processData(data: any) { /* ... */ }

// Don't use promises without error handling
fetchBalance(address).then(balance => console.log(balance));

// Don't use non-null assertions without justification
const balance = user!.wallet!.balance!;
```

### React Components

✅ **Do**:
```typescript
// Use functional components with hooks
export const SendButton: React.FC<Props> = ({ onClick, disabled }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = useCallback(async () => {
    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  }, [onClick]);
  
  return (
    <button onClick={handleClick} disabled={disabled || isLoading}>
      {isLoading ? 'Sending...' : 'Send'}
    </button>
  );
};

// Wrap components with ErrorBoundary
<ErrorBoundary>
  <TransactionList />
</ErrorBoundary>
```

❌ **Don't**:
```typescript
// Don't use class components (prefer functional)
class SendButton extends React.Component { /* ... */ }

// Don't forget dependency arrays in hooks
useEffect(() => {
  fetchData();
}); // Missing dependency array!

// Don't use inline functions in JSX (creates new function on each render)
<button onClick={() => handleClick(id)}>Click</button>
```

### Logging

✅ **Do**:
```typescript
import { logger } from '../infrastructure/logger';

// Use appropriate log levels
logger.info('Wallet created successfully', { accountName });
logger.warn('Slow network response', { duration: 3000 });
logger.error('Transaction signing failed', error, { txid });

// Measure performance of critical operations
await logger.measure('signTransaction', async () => {
  return await signer.sign(pset);
});
```

❌ **Don't**:
```typescript
// Don't use console.log directly
console.log('User clicked send button');

// Don't log sensitive data
logger.info('Mnemonic:', mnemonic); // ❌ NEVER!
```

### Error Handling

✅ **Do**:
```typescript
// Create custom error classes
export class InsufficientFundsError extends Error {
  constructor(required: number, available: number) {
    super(`Insufficient funds: need ${required}, have ${available}`);
    this.name = 'InsufficientFundsError';
  }
}

// Handle errors gracefully
try {
  await sendTransaction(tx);
} catch (error) {
  if (error instanceof InsufficientFundsError) {
    showToast('Not enough funds');
  } else {
    logger.error('Transaction failed', error as Error);
    showToast('Transaction failed. Please try again.');
  }
}
```

❌ **Don't**:
```typescript
// Don't swallow errors silently
try {
  await riskyOperation();
} catch (e) {
  // Nothing here - error disappears!
}

// Don't use generic error messages
throw new Error('Failed'); // Not helpful!
```

## Testing Requirements

All new code must include tests. We aim for **70%+ code coverage**.

### Unit Tests (Jest)

**Test domain logic**:
```typescript
// test/domain/pset-builder.spec.ts
describe('PsetBuilder', () => {
  it('should build valid PSET with inputs and outputs', () => {
    const builder = new PsetBuilder();
    const pset = builder
      .addInput(mockUtxo)
      .addOutput({ asset, value, address })
      .build();
    
    expect(pset.inputs).toHaveLength(1);
    expect(pset.outputs).toHaveLength(1);
  });
  
  it('should throw error when building PSET without outputs', () => {
    const builder = new PsetBuilder().addInput(mockUtxo);
    expect(() => builder.build()).toThrow('PSET must have at least one output');
  });
});
```

**Test React components**:
```typescript
// test/extension/send-button.spec.tsx
import { render, fireEvent, screen } from '@testing-library/react';

describe('SendButton', () => {
  it('should call onClick when clicked', async () => {
    const onClick = jest.fn();
    render(<SendButton onClick={onClick} />);
    
    fireEvent.click(screen.getByText('Send'));
    
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  
  it('should show loading state while sending', async () => {
    const onClick = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<SendButton onClick={onClick} />);
    
    fireEvent.click(screen.getByText('Send'));
    expect(screen.getByText('Sending...')).toBeInTheDocument();
    
    await waitFor(() => expect(screen.getByText('Send')).toBeInTheDocument());
  });
});
```

**Run tests**:
```bash
# Run all unit tests
yarn test

# Run specific test file
yarn test test/domain/pset-builder.spec.ts

# Run with coverage report
yarn test --coverage
```

### E2E Tests (Playwright)

**Test critical user flows**:
```typescript
// playwright-tests/send-transaction.spec.ts
test('should send transaction successfully', async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/index.html`);
  
  // Unlock wallet
  await page.fill('[data-testid="password-input"]', 'testpassword');
  await page.click('[data-testid="unlock-button"]');
  
  // Navigate to send view
  await page.click('[data-testid="send-button"]');
  
  // Fill form
  await page.fill('[data-testid="address-input"]', recipientAddress);
  await page.fill('[data-testid="amount-input"]', '0.1');
  
  // Submit
  await page.click('[data-testid="confirm-send"]');
  
  // Verify success
  await expect(page.locator('text=Transaction sent')).toBeVisible();
});
```

**Run E2E tests**:
```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
yarn test:playwright

# Run in headed mode (see browser)
yarn test:playwright --headed

# Run specific test
yarn test:playwright send-transaction.spec.ts
```

### Test for Liquid Network

Some tests require a running Liquid regtest node:

```bash
# Install nigiri (Liquid development environment)
npm install -g nigiri

# Start Liquid regtest node
nigiri start --liquid

# Run WebSocket proxy for Electrum
websocat -b ws-l:127.0.0.1:1234 tcp:127.0.0.1:50001

# Run tests
yarn test
```

## Code Quality Checks

Before submitting a PR, ensure all checks pass:

```bash
# Lint TypeScript code
yarn lint

# Fix auto-fixable issues
yarn lint:fix

# Format code with Prettier
yarn prettier

# Check formatting (CI uses this)
yarn prettier:check

# Build extension
yarn build
yarn build:v3

# Validate extension manifest
yarn web-ext:lint
```

## Submitting Changes

### Branch Naming

- `feature/short-description` - New features
- `fix/issue-number-description` - Bug fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation updates

Examples:
- `feature/add-asset-search`
- `fix/123-balance-calculation-error`
- `refactor/split-pset-builder`
- `docs/update-architecture-guide`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`

**Examples**:
```
feat(wallet): add asset search functionality

Allow users to search for assets by name or asset ID in the asset selection dropdown.

Closes #123
```

```
fix(transaction): correct balance calculation for confidential assets

Previously, unblinded values were not summed correctly when multiple UTXOs
of the same asset were present. This fix ensures accurate balance display.

Fixes #456
```

### Pull Request Process

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes** following the guidelines above

3. **Add tests** for your changes

4. **Run all quality checks**:
   ```bash
   yarn lint
   yarn prettier
   yarn test
   yarn build
   ```

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat(wallet): add my feature"
   ```

6. **Push to your fork**:
   ```bash
   git push origin feature/my-feature
   ```

7. **Open a Pull Request** on GitHub:
   - Use a descriptive title
   - Reference related issues (e.g., "Closes #123")
   - Describe what changed and why
   - Add screenshots for UI changes
   - Request review from maintainers

### PR Review Checklist

Before requesting review, ensure:

- [ ] All tests pass (`yarn test`)
- [ ] Linting passes (`yarn lint`)
- [ ] Code is formatted (`yarn prettier`)
- [ ] Extension builds successfully (`yarn build && yarn build:v3`)
- [ ] No TypeScript errors (`tsc --noEmit`)
- [ ] Added tests for new functionality
- [ ] Updated documentation if needed
- [ ] No sensitive data in commits (mnemonics, private keys, passwords)
- [ ] Tested manually in browser extension

## Release Process

Releases are managed by repository maintainers:

1. **Version bump** in `package.json` (follows [Semantic Versioning](https://semver.org/))
2. **Update CHANGELOG.md** with release notes
3. **Create git tag**: `git tag v0.6.5`
4. **Push tag**: `git push origin v0.6.5`
5. **GitHub Actions** automatically builds and publishes release artifacts

## Getting Help

- **Questions?** Open a [GitHub Discussion](https://github.com/vulpemventures/marina/discussions)
- **Bugs?** Report an [issue](https://github.com/vulpemventures/marina/issues)
- **Security issues?** Email [marinawallet@vulpem.com](mailto:marinawallet@vulpem.com)

## Code of Conduct

Be respectful and constructive in all interactions. We're all here to make Marina better!

Thank you for contributing! 🎉
