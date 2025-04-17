import { CoCart } from '../cocart';

/**
 * Base class for all API endpoints
 */
export abstract class BaseEndpoint {
  protected cocart: CoCart;

  constructor(cocart: CoCart) {
    this.cocart = cocart;
  }
}
