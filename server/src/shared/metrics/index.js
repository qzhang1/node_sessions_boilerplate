import promClient from "prom-client";
import url from "url";

export function InitMetrics() {
  // metrics container
  const metrics = new promClient.Registry();
  metrics.setDefaultLabels({
    app: "node-sessions",
  });

  // defaults
  promClient.collectDefaultMetrics({
    register: metrics,
  });

  // customs
  const httpRequestDurationMicroseconds = new promClient.Histogram({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "route", "code"],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10], // 0.1 to 10 seconds
  });
  metrics.registerMetric(httpRequestDurationMicroseconds);
  return { metrics, httpRequestDurationMicroseconds };
}

export function HttpMetricMiddleware(httpRequestDurationMicroseconds) {
  return (req, res, next) => {
    const end = httpRequestDurationMicroseconds.startTimer();
    const route = url.parse(req.url).pathname;
    res.on("finish", () => {
      console.log("finished measuring");
      end({ route, code: res.statusCode, method: req.method });
    });
    next();
  };
}
