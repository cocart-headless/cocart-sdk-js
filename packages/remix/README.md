# CoCart Remix Adapter

This package provides Remix specific configuration for the CoCart SDK.

## Installation

The adapter can be installed with either [npm](https://www.npmjs.com/), [pnpm](https://pnpm.io/), [bun](https://bun.sh/) or [yarn](https://classic.yarnpkg.com/en/) package managers.

### NPM
```bash
npm install @cocart/remix
```

### Yarn
```bash
yarn add @cocart/remix
```

### PNPM
```bash
pnpm add @cocart/remix
```

### BUN
```bash
bun add @cocart/remix
```

## Usage

```typescript
import { CoCart } from '@cocart/remix';

// Use anywhere in your Remix application
const client = new CoCart({
  url: 'your-store-url'
});
```
