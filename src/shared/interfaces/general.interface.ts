export interface RequestCountRateLimitI {
  ip: string;
  originalUrl: string;
  method: string;
  count: number;
}
