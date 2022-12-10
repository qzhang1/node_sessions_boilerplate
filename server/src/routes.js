import { Router } from "express";
import initAuthHandlers from "./modules/auth/auth.router.js";
import initUserHandlers from "./modules/user/user.router.js";

export default function (app, db) {
  const router = Router();
  router.use("/auth", initAuthHandlers(db));
  router.use("/user", initUserHandlers());
  app.use("/api", router);
}
