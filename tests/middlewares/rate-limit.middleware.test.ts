import {
  CodeHttpEnum,
  ERR_403,
  ERR_429,
  faliedMiddleware,
} from "../../src/shared";
import rateLimitMiddleware from "./../../src/middlewares/rate-limit.middleware";
import { serviceModel } from "./../../src/models/services.model";

jest.mock("./../../src/models/services.model");

describe("rateLimitMiddleware", () => {
  let req: any;
  let res: any;
  let next: jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    req = {
      ip: "127.0.0.1",
      originalUrl: "/api",
      baseUrl: "/api",
      setTimeout: jest.fn(),
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    // Reset global.requestCounts if used in middleware
    (global as any).requestCounts = undefined;
  });

  it("should call next if under the rate limit", async () => {
    const mockServices = [
      {
        target: "http://127.0.0.1:4000/api",
        middlewares: [
          {
            name: "rate-limit.middleware",
            props: {
              rateLimit: 0,
            },
          },
        ],
      },
    ];
    (serviceModel.find as jest.Mock).mockResolvedValueOnce(mockServices);

    (global as any).requestCounts = [
      { ip: req.ip, url: req.originalUrl, count: 1, timestamp: Date.now() },
    ];
    await rateLimitMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should block request if over the rate limit", async () => {
    const mockServices = [
      {
        target: "http://127.0.0.1:4000/api",
        middlewares: [
          {
            name: "rate-limit.middleware",
            props: {
              rateLimit: 0,
            },
          },
        ],
      },
    ];
    (serviceModel.find as jest.Mock).mockResolvedValueOnce(mockServices);

    (global as any).requestCounts = [
      {
        ip: req.ip,
        originalUrl: req.originalUrl,
        method: req.method,
        count: 101,
      },
    ];
    await rateLimitMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      faliedMiddleware(ERR_429, CodeHttpEnum.forbidden)
    );
  });

  it("should initialize requestCounts if not present", async () => {
    const mockServices = [
      {
        target: "http://127.0.0.1:4000/api",
        middlewares: [
          {
            name: "rate-limit.middleware",
            props: {
              rateLimit: 0,
            },
          },
        ],
      },
    ];
    (serviceModel.find as jest.Mock).mockResolvedValueOnce(mockServices);
    (global as any).requestCounts = [];
    await rateLimitMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(Array.isArray((global as any).requestCounts)).toBe(true);
    expect((global as any).requestCounts).toHaveLength(1);
  });
});
