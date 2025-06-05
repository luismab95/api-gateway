export interface RouteI {
  protocol: string;
  route: string;
  port: number;
  host: string;
  target: string;
  middlewares: MiddlewareI[];
}

export interface MiddlewareI {
  name: string;
  props: any;
}

export interface ProxyI {
  route: string;
  middlewares: any[];
  proxy: any;
}
