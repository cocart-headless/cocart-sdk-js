# @cocart/sdk

Developer-friendly & type-safe Typescript SDK specifically catered to leverage CoCart API.

<a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" style="width: 100px; height: 28px;" />
</a>

<!-- Start Summary [summary] -->
## Summary

CoCart API

Read the docs at https://docs.cocartapi.com/api-reference
<!-- End Summary [summary] -->

<!-- Start SDK Installation [installation] -->
## SDK Installation

The SDK can be installed with either [npm](https://www.npmjs.com/), [pnpm](https://pnpm.io/), [bun](https://bun.sh/) or [yarn](https://classic.yarnpkg.com/en/) package managers.

### NPM
```bash
# Using npm
npm install @cocart/sdk
```

### Yarn
```bash
yarn add @cocart/sdk
```

### PNPM
```bash
pnpm add @cocart/sdk
```

### BUN
```bash
bun add @cocart/sdk
```

> [!NOTE]
> This package is published with CommonJS and ES Modules (ESM) support.

## Supported JavaScript Runtimes

This SDK supports JavaScript runtimes that support ECMAScript 2020 or newer:

- **Browsers**: Chrome, Safari, Edge, Firefox (evergreen browsers)
- **Node.js**: v18 and v20 (active and maintenance LTS releases)
- **Bun**: v1 and above
- **Deno**: v1.39 and above

## Recommended TypeScript Compiler Options

For the best experience with this SDK, use the following TypeScript compiler options:

```json
{
  "compilerOptions": {
    "target": "es2020", // or higher
    "lib": ["es2020", "dom", "dom.iterable"],
  }
}
```

## Basic Usage

```typescript
import { CoCartClient } from '@cocart/sdk';

// Initialize client
const client = new CoCartClient({
  siteUrl: 'https://example.com',
  // Optional configurations
  apiVersion: 'v2',
  apiPrefix: 'wp-json/cocart',
  timeout: 30000,
});

// Example: Get cart contents
async function getCart() {
  try {
    const cart = await client.cart.get();
    console.log(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
  }
}

// Example: Add item to cart
async function addToCart() {
  try {
    const result = await client.cart.addItem({
      id: 123,
      quantity: 1,
    });
    console.log('Item added:', result);
  } catch (error) {
    console.error('Error adding item to cart:', error);
  }
}
```

## Authentication

The SDK supports multiple authentication methods:

### Basic Authentication

```typescript
const client = new CoCartClient({
  siteUrl: 'https://example.com',
  auth: {
    type: 'basic',
    username: 'consumer_key',
    password: 'consumer_secret',
  },
});
```

### JWT Authentication

```typescript
const client = new CoCartClient({
  siteUrl: 'https://example.com',
  auth: {
    type: 'jwt',
    token: 'your_jwt_token',
  },
});
```

<!-- Start Custom HTTP Client [http-client] -->
## Custom HTTP Client

The TypeScript SDK makes API calls using an `HTTPClient` that wraps the native [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). This client is a thin wrapper around `fetch` and provides the ability to attach hooks around the request lifecycle that can be used to modify the request or handle errors and response.

The `HTTPClient` constructor takes an optional `fetcher` argument that can be used to integrate a third-party HTTP client or when writing tests to mock out the HTTP client and feed in fixtures.

The following example shows how to use the `"beforeRequest"` hook to add a custom header and a timeout to requests and how to use the `"requestError"` hook to log errors:

```typescript
import { createCustomHttpClient } from '@cocart/sdk';

const customFetcher = async (url, options) => {
  // Custom fetch implementation
  return await fetch(url, options);
};

const client = new CoCartClient({
  siteUrl: 'https://example.com',
  httpClient: createCustomHttpClient({ fetcher: customFetcher }),
});
```

<!-- Start Pagination [pagination] -->
## Pagination

Some of the endpoints in this SDK support pagination. To use pagination, you make your SDK calls as usual, but the returned response object will also be an async iterable that can be consumed using the [`for await...of`][for-await-of] syntax.

[for-await-of]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of

Here's an example of one such pagination call:

```typescript
```

# Development

## Maturity

This SDK is in beta, and there may be breaking changes between versions without a major version update. Therefore, we recommend pinning usage to a specific package version. This way, you can install the same version each time without breaking changes unless you are intentionally looking for the latest version.

## Contributions

We look forward to hearing your feedback. Feel free to open a PR or an issue with a proof of concept and we'll do our best to include it in a future release.
