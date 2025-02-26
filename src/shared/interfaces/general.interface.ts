export interface RequestCountRateLimitInterface {
  ip: string;
  originalUrl: string;
  method: string;
  count: number;
}
