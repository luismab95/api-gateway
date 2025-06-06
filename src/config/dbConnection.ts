import mongoose from "mongoose";
import { environment, logger } from "../shared";

export async function connectDB() {
  try {
    const { MONGO_DB_URI } = environment;
    await mongoose.connect(MONGO_DB_URI);
    logger.info("Conexión con base de datos establecida...");
  } catch (error) {
    logger.error("Error de conexión con base de datos", error);
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info("Base de datos desconectada...");
  } catch (error) {
    logger.error("Error al desconectar la base de datos", error);
  }
}
