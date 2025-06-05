import { serviceModel } from "../models/services.model";
import { connectDB } from "../config/dbConnection";
import { logger, RouteI } from "../shared";

export async function getRoutes() {
  try {
    await connectDB();
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
