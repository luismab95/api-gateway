import fs from "fs";
import path from "path";
import { RoutesInterface } from "../interfaces/routes.interface";

const routesPath = path.join(process.cwd(), "config.json");

const routes: RoutesInterface[] = JSON.parse(
  fs.readFileSync(routesPath, "utf-8")
);

export { routes };
