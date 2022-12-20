import { Router } from "express";
import { UserService } from "./user.service.js";
import {
  isUserAuthenticated,
  isUserAuthorized,
} from "../../middleware/auth.js";

export default function (db) {
  const router = Router();
  const userService = new UserService(db);
  const adminAuthorization = isUserAuthorized("admin");

  router.use(isUserAuthenticated);

  router.get("/me", (req, res) => {
    res.json(req.user);
  });

  router.get(
    "/all",
    isUserAuthenticated,
    adminAuthorization,
    async (req, res) => {
      const users = await userService.getAllUsers();
      res.json(users);
    }
  );
  return router;
}
