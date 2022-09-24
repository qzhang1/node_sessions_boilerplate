import { Router } from "express";
import {
  isUserAuthenticated,
  isUserAuthorized,
} from "../../middleware/auth.js";

export default function () {
  const router = Router();
  const adminAuthorization = isUserAuthorized("admin");
  router.get("/me", isUserAuthenticated, (req, res) => {
    res.json(req.user);
  });

  router.get("/all", isUserAuthenticated, adminAuthorization, (req, res) => {
    res.json({
      message: "hi",
    });
  });
  return router;
}
