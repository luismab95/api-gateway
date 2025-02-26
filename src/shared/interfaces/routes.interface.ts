export interface RoutesInterface {
  route: string;
  target: string;
  middlewares: MiddlewareInterface[];
}

interface MiddlewareInterface {
  name: string;
  props: any;
}
