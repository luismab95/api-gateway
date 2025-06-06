import mongoose from "mongoose";
import { connectDB, disconnectDB } from "../../src/config/dbConnection";
import { environment, logger } from "../../src/shared";

jest.mock("mongoose");
jest.mock("../../src/shared", () => ({
  environment: { MONGO_DB_URI: "mongodb://localhost:27017/test" },
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe("dbConnection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("connectDB", () => {
    it("should connect to the database and log success", async () => {
      (mongoose.connect as jest.Mock).mockResolvedValueOnce(undefined);

      await connectDB();

      expect(mongoose.connect).toHaveBeenCalledWith(environment.MONGO_DB_URI);
      expect(logger.info).toHaveBeenCalledWith(
        "Conexión con base de datos establecida..."
      );
      expect(logger.error).not.toHaveBeenCalled();
    });

    it("should log error if connection fails", async () => {
      const error = new Error("Connection failed");
      (mongoose.connect as jest.Mock).mockRejectedValueOnce(error);

      await connectDB();

      expect(logger.error).toHaveBeenCalledWith(
        "Error de conexión con base de datos",
        error
      );
    });
  });

  describe("disconnectDB", () => {
    it("should disconnect from the database and log success", async () => {
      (mongoose.disconnect as jest.Mock).mockResolvedValueOnce(undefined);

      await disconnectDB();

      expect(mongoose.disconnect).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith("Base de datos desconectada...");
      expect(logger.error).not.toHaveBeenCalled();
    });

    it("should log error if disconnection fails", async () => {
      const error = new Error("Disconnection failed");
      (mongoose.disconnect as jest.Mock).mockRejectedValueOnce(error);

      await disconnectDB();

      expect(logger.error).toHaveBeenCalledWith(
        "Error al desconectar la base de datos",
        error
      );
    });
  });
});
