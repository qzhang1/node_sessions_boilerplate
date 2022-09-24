export function isUserAuthenticated(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.status(403).json({
      error: "user is not authenticated",
    });
  }
}

export function isUserAuthorized(role) {
  return function (req, res, next) {
    const { user } = req;
    const roles = user.roles.split(",");
    if (roles.some((r) => r === role)) {
      next();
    } else {
      res.status(403).json({
        error: "user is not authorized",
      });
    }
  };
}
