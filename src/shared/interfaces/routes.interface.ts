export interface RoutesInterface {
  route: string;
  target: string;
  middlewares: string[];
  origins: string[];
  whiteListPermission: string[];
}
