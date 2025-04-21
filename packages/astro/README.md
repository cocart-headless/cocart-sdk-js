# CoCart Astro Adapter

This package provides Astro specific configuration for the CoCart SDK.

## Installation

The adapter can be installed with either [npm](https://www.npmjs.com/), [pnpm](https://pnpm.io/), [bun](https://bun.sh/) or [yarn](https://classic.yarnpkg.com/en/) package managers.

### NPM
```bash
npm install @cocart/astro
```

### Yarn
```bash
yarn add @cocart/astro
```

### PNPM
```bash
pnpm add @cocart/astro
```

### BUN
```bash
bun add @cocart/astro
```

## Usage

```typescript
import { CoCart } from '@cocart/astro';

// Use anywhere in your Astro application
const client = new CoCart({
  url: 'your-store-url'
});
```
