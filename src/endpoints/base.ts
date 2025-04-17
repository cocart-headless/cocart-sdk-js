import { CoCartClient } from '../cocart-client';

/**
 * Base class for all API endpoints
 */
export abstract class BaseEndpoint {
  protected client: CoCartClient;

  constructor(client: CoCartClient) {
    this.client = client;
  }
}
