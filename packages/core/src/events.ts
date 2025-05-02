import { CoCartError } from './http/errors';
import { HttpRequestOptions, HttpResponse } from './types/http';

export interface SDKHttpEventMap {
  onBeforeRequest: (url: string, options: HttpRequestOptions) => void;
  onAfterRequest: <T>(response: HttpResponse<T>) => void;
  onRequestError: (error: CoCartError) => void;
}
export interface SDKEventMap extends SDKHttpEventMap {}

export type EventName = keyof SDKEventMap;
