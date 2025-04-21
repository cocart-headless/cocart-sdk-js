# Customer Authentication

The CoCart SDK provides customer authentication with optional JWT support.

## Basic Usage

```typescript
const cocart = new CoCart({
  siteUrl: 'https://example.com',
  customer: {
    validateInterval: 5 * 60 * 1000 // Optional: validate JWT every 5 minutes
  }
});

// Login
const response = await cocart.customer.login({
  username: 'customer@example.com',
  password: 'password123'
});

console.log('Logged in as:', response.display_name);
```

## JWT Support

If the CoCart JWT Authentication plugin is installed, the login response will include JWT tokens and are automatically managed.

```typescript
if (response.extras?.jwt_token) {
  console.log('JWT authentication enabled');
}

// The SDK will automatically:
// 1. Store the JWT token
// 2. Use it for future requests
// 3. Refresh it when needed
// 4. Validate it periodically
```

## Manual Token Management

```typescript
// Validate token
await cocart.customer.validateToken(token);

// Refresh token
const newTokens = await cocart.customer.refreshToken(refreshToken);
```

## Cleanup

```typescript
// Clean up resources when done
cocart.customer.destroy();
```
