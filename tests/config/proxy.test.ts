import { startProxy } from "../../src/config/proxy";
import { createProxyMiddleware } from "http-proxy-middleware";
import { services, logger, CodeHttpEnum, ERR_502 } from "../../src/shared";

jest.mock("http-proxy-middleware", () => ({
  createProxyMiddleware: jest.fn(() => "proxy-middleware-mock"),
}));
jest.mock("../../src/shared", () => ({
  services: jest.fn(),
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
  CodeHttpEnum: { internalServerError: 500 },
  ERR_502: "Bad Gateway",
}));

describe("startProxy", () => {
  const mockRoute = {
    route: "/api/test",
    target: "http://localhost:3001",
    middlewares: [{ name: "auth" }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).requestCounts = undefined;
    jest.resetModules();
  });

  it("should initialize global.requestCounts and setInterval", async () => {
    (services as jest.Mock).mockResolvedValueOnce([]);
    jest.useFakeTimers();

    await startProxy();

    expect(global.requestCounts).toBeDefined();
    expect(Array.isArray(global.requestCounts)).toBe(true);

    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should create proxies for each route", async () => {
    const mockMiddleware = jest.fn();
    jest.mock(
      "../../src/middlewares/auth",
      () => ({ __esModule: true, default: mockMiddleware }),
      { virtual: true }
    );
    (services as jest.Mock).mockResolvedValueOnce([
      { ...mockRoute, middlewares: [{ name: "auth" }] },
    ]);

    const apis = await startProxy();

    expect(apis).toHaveLength(1);
    expect(apis[0].route).toBe(mockRoute.route);
    expect(apis[0].middlewares[0]).toBe(mockMiddleware);
    expect(apis[0].proxy).toBe("proxy-middleware-mock");
    expect(createProxyMiddleware).toHaveBeenCalled();
  });

  it("should handle proxy error event", async () => {
    const errorHandler = jest.fn();
    (services as jest.Mock).mockResolvedValueOnce([
      { ...mockRoute, middlewares: [] },
    ]);
    (createProxyMiddleware as jest.Mock).mockImplementation((opts: any) => {
      errorHandler.mockImplementation(() => opts.on.error);
      return "proxy-middleware-mock";
    });

    const apis = await startProxy();
    const proxyOptions = (createProxyMiddleware as jest.Mock).mock.calls[0][0];

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const error = new Error("Proxy failed");

    proxyOptions.on.error(error, {} as any, mockRes as any);

    expect(logger.error).toHaveBeenCalledWith("PROXY ERROR: Proxy failed");
    expect(mockRes.status).toHaveBeenCalledWith(
      CodeHttpEnum.internalServerError
    );
    expect(mockRes.json).toHaveBeenCalledWith({
      status: false,
      message: ERR_502,
    });
  });

  it("should handle empty middlewares array", async () => {
    (services as jest.Mock).mockResolvedValueOnce([
      { ...mockRoute, middlewares: [] },
    ]);
    const apis = await startProxy();
    expect(apis[0].middlewares).toEqual([]);
  });
});
