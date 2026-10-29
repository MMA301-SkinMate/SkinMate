const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

if (process.platform === "win32") {
  const enhanceExpoMiddleware = config.server.enhanceMiddleware;

  // Android's multipart downloader can stall on large Metro responses on Windows.
  // https://github.com/expo/expo/issues/49111
  config.server.enhanceMiddleware = (metroMiddleware, server) => {
    const middleware = enhanceExpoMiddleware
      ? enhanceExpoMiddleware(metroMiddleware, server)
      : metroMiddleware;

    return (request, response, next) => {
      const url = new URL(request.url, "http://localhost");
      if (
        request.method === "GET" &&
        url.pathname.endsWith(".bundle") &&
        url.searchParams.get("platform") === "android" &&
        String(request.headers.accept || "").includes("multipart/mixed")
      ) {
        request.headers.accept = "application/javascript";
      }

      return middleware(request, response, next);
    };
  };
}

module.exports = config;
