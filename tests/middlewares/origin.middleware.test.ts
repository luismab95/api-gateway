import originMiddleware from "../../src/middlewares/origin.middleware";
import { serviceModel } from "../../src/models/services.model";
import { CodeHttpEnum, ERR_403, faliedMiddleware } from "../../src/shared";

jest.mock("../../src/models/services.model");

describe("originMiddleware", () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      headers: { origin: "http://allowed.com" },
      ip: "127.0.0.1",
      originalUrl: "/api",
      baseUrl: "/api",
      method: "GET",
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should call next if origin is allowed", async () => {
    const mockServices = [
      {
        allowedOrigins: ["http://allowed.com"],
        route: "/api/test",
      },
    ];
    (serviceModel.find as jest.Mock).mockResolvedValueOnce(mockServices);

    await originMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should block if origin is not allowed", async () => {
    const mockServices = [
      {
        target: "http://127.0.0.1:4000/api",
        middlewares: [
          {
            name: "origin.middleware",
            props: {
              origins: [],
            },
          },
        ],
      },
    ];
    (serviceModel.find as jest.Mock).mockResolvedValueOnce(mockServices);

    await originMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      faliedMiddleware(ERR_403, CodeHttpEnum.forbidden)
    );
  });

  it("should call next if no allowedOrigins are set", async () => {
    const mockServices = [
      {
        target: "http://127.0.0.1:4000/api",
        middlewares: [],
      },
    ];
    (serviceModel.find as jest.Mock).mockResolvedValueOnce(mockServices);

    await originMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should call next if no matching service is found", async () => {
    (serviceModel.find as jest.Mock).mockResolvedValueOnce([]);

    await originMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
