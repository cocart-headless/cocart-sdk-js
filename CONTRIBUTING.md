# Contributing to @cocart/core

We love your input! We want to make contributing to @cocart/core as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Requests

1. Fork the repository and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Submit your pull request!

### Development Workflow

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run linting
npm run lint

# Format code
npm run format

# Build the package
npm run build
```

## Testing

We use Jest for testing. Please make sure to write tests for any new features or bug fixes.

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch
```

## Coding Style

We use ESLint and Prettier to enforce a consistent coding style. Please make sure your code passes the linting checks.

```bash
# Run linting
npm run lint

# Format code
npm run format
```

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/cocart-headless/cocart-sdk-js/tags).

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.
