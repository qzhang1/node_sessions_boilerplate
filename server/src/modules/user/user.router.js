import { Router } from "express";
import {
  isUserAuthenticated,
  isUserAuthorized,
} from "../../middleware/auth.js";

export default function ({ userService }) {
  const router = Router();
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
