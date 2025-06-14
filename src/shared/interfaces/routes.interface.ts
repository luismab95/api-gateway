export interface RouteI {
  protocol: string;
  route: string;
  port: number;
  host: string;
  target: string;
}

export interface ProxyI {
  route: string;
  proxy: any;
}
