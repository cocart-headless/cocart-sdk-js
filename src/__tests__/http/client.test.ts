import { DefaultHttpClient, APIError, createCustomHttpClient } from '../../http/client';

// Mock fetch
global.fetch = jest.fn();

describe('DefaultHttpClient', () => {
  let client: DefaultHttpClient;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    mockFetch = global.fetch as jest.Mock;
    mockFetch.mockClear();
    client = new DefaultHttpClient();
  });

  it('should make a successful request', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
      },
      json: jest.fn().mockResolvedValue({ message: 'success' }),
    };
    mockFetch.mockResolvedValue(mockResponse);

    const response = await client.request('https://example.com/api', {
      method: 'GET',
      headers: { 'Custom-Header': 'value' },
    });

    expect(mockFetch).toHaveBeenCalledWith('https://example.com/api', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Custom-Header': 'value',
      },
      signal: expect.any(AbortSignal),
    });
    expect(response.data).toEqual({ message: 'success' });
    expect(response.status).toBe(200);
  });

  it('should handle error responses', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
      },
      json: jest.fn().mockResolvedValue({ message: 'Not found' }),
    };
    mockFetch.mockResolvedValue(mockResponse);

    await expect(client.request('https://example.com/api')).rejects.toThrow(APIError);
    await expect(client.request('https://example.com/api')).rejects.toMatchObject({
      message: 'Not found',
      status: 404,
    });
  });

  it('should handle request timeouts', async () => {
    // Setup a timeout
    jest.useFakeTimers();

    // Start a request with a timeout
    const promise = client.request('https://example.com/api', { timeout: 1000 });

    // Fast-forward time past the timeout
    jest.advanceTimersByTime(1100);

    // Verify it rejects with a timeout error
    await expect(promise).rejects.toThrow('Request timed out');
    await expect(promise).rejects.toMatchObject({
      status: 408,
    });

    jest.useRealTimers();
  });

  it('should use a custom fetcher if provided', async () => {
    const customFetcher = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: jest.fn().mockReturnValue('application/json'),
      },
      json: jest.fn().mockResolvedValue({ custom: true }),
    });

    const customClient = createCustomHttpClient({ fetcher: customFetcher });
    const response = await customClient.request('https://example.com/api');

    expect(customFetcher).toHaveBeenCalled();
    expect(response.data).toEqual({ custom: true });
  });
});
