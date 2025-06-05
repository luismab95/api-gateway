import { RouteI } from "../interfaces/routes.interface";
import { getRoutes } from "../../repositories/service.repository";

export async function services(): Promise<RouteI[]> {
  return await getRoutes();
}
