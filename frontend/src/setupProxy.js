const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    createProxyMiddleware("/api", {
      target: "https://unify.onrender.com/",
      changeOrigin: true,
    })
  );
  /* app.use(
    "/api",
    createProxyMiddleware({
      target: "https://unify.onrender.com/",
    })
  ); */
};
