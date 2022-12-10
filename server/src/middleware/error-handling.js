export function NotFound404(req, res, next) {
  res.status(404);
  const error = new Error(`${req.originalUrl} - Not Found`);
  next(error);
}

export function ErrorHandle(err, req, res, next) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "not available" : err.stack,
  });
}
