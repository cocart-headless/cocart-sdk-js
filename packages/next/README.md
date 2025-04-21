# CoCart Next.js Adapter

This package provides Next.js specific configuration for the CoCart SDK.

## Installation

The adapter can be installed with either [npm](https://www.npmjs.com/), [pnpm](https://pnpm.io/), [bun](https://bun.sh/) or [yarn](https://classic.yarnpkg.com/en/) package managers.

### NPM
```bash
npm install @cocart/next
```

### Yarn
```bash
yarn add @cocart/next
```

### PNPM
```bash
pnpm add @cocart/next
```

### BUN
```bash
bun add @cocart/next
```

## Usage

```typescript
import { CoCart } from '@cocart/next';

// Use anywhere in your Next.js application
const client = new CoCart({
  url: 'your-store-url'
});
```
