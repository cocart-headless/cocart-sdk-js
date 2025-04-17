// Add any global setup for tests here
global.fetch = jest.fn();

// Silence console during tests, remove these if you want to see the output
global.console.log = jest.fn();
global.console.error = jest.fn();
global.console.warn = jest.fn();

// Reset mocks before each test
beforeEach(() => {
  jest.resetAllMocks();
}); 