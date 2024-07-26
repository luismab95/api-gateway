import { RoutesInterface } from "../shared/interfaces/routes.interface";

export async function getRoutes() {
  const routes: RoutesInterface[] = [
    {
      middlewares: ["rate-limit.middleware"],
      origins: [],
      whiteListPermission: [],
      route: "/ms-security",
      target: "http://localhost:3003/ms-security",
    },
    {
      middlewares: ["rate-limit.middleware"],
      origins: [],
      whiteListPermission: [],
      route: "/ms-auth",
      target: "http://localhost:3000/ms-auth",
    },
    {
      middlewares: ["rate-limit.middleware"],
      origins: [],
      whiteListPermission: [],
      route: "/ms-file",
      target: "http://localhost:3002/ms-file",
    },
    {
      middlewares: ["rate-limit.middleware"],
      origins: [],
      whiteListPermission: [],
      route: "/ms-email",
      target: "http://localhost:3001/ms-email",
    },
    {
      middlewares: ["rate-limit.middleware"],
      origins: [],
      whiteListPermission: [],
      route: "/ms-cms",
      target: "http://localhost:3004/ms-cms",
    },
  ];

  return routes;
}
