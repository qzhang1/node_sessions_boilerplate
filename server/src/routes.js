import { Router } from "express";
import initAuthHandlers from "./modules/auth/auth.router.js";
import initUserHandlers from "./modules/user/user.router.js";
import initStockHandlers from "./modules/stocks/stock.router.js";

export default function (dependencies) {
  const router = Router();
  router.use("/auth", initAuthHandlers(dependencies));
  router.use("/user", initUserHandlers(dependencies));
  router.use("/stocks", initStockHandlers(dependencies));
  return router;
}
