import { serviceModel } from "../models/services.model";
import { logger, RouteI } from "../shared";

export async function getRoutes() {
  try {
    const services = await serviceModel.find({ status: true });
    const routes = services.map((item) => {
      item.target = `${item.protocol}://${item.host}:${item.port}${item.route}`;
      return item;
    });
    return routes as RouteI[];
  } catch (error) {
    logger.error(error);
  }
}
