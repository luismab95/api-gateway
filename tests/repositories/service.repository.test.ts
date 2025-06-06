import * as serviceRepository from "./../../src/repositories/service.repository";
import { serviceModel } from "./../../src/models/services.model";

jest.mock("./../../src/models/services.model");

describe("service.repository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllServices", () => {
    it("should return all services", async () => {
      const mockServices = [{ name: "service1" }, { name: "service2" }];
      (serviceModel.find as jest.Mock).mockResolvedValueOnce(mockServices);

      const result = await serviceRepository.getRoutes();

      expect(serviceModel.find).toHaveBeenCalledWith({ status: true });
      expect(result).toEqual(mockServices);
    });

    it("should throw error if find fails", async () => {
      (serviceModel.find as jest.Mock).mockRejectedValueOnce(
        new Error("DB error")
      );
      await expect(serviceRepository.getRoutes()).resolves.toBeUndefined();
    });
  });
});
