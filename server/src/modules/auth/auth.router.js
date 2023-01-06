import { Router } from "express";
import bcrypt from "bcrypt";
import { UserModel } from "../user/user.service.js";
import passport from "passport";

export default function ({ userService }) {
  const router = Router();
  router.post("/signup", async (req, res) => {
    const logger = req.log;
    try {
      const { email, password } = req.body;
      const existingUser = await userService.getByEmail(email);
      if (existingUser) {
        res.status(400).json({
          message: `user ${email} already exists`,
        });
        return;
      }

      const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS));
      const hashed_pwd = await bcrypt.hash(password, salt);

      const err = await userService.insert(
        UserModel.CreateWithBasicAuth(email, hashed_pwd, salt, "user")
      );
      if (err) {
        throw new Error(err);
      }
      res.status(201).json({
        message: `user ${email} has successfully registered`,
      });
    } catch (err) {
      logger.error(err);
      // users don't need to know specifics of app error
      res.status(500).json({
        error: "unexpected error while registering user",
      });
    }
  });

  router.post("/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json({
      message: "successfully logged in",
    });
  });

  router.get("/logout", (req, res, next) => {
    req.session.destroy((err) => {
      if (err) {
        logger.error(err);
        res.status(500).json({
          error: "unexpected error while destroying session",
        });
      } else {
        res.json({
          message: "successfully logged out",
        });
      }
    });
  });

  router.get(
    "/google",
    passport.authenticate("google", { scope: ["email", "profile"] })
  );

  router.get(
    "/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/login",
      failureMessage: "Cannot login to Google, please try again later!",
    }),
    (req, res) => {
      res.status(200).json({
        message: "successfully authenticated through google oauth",
      });
    }
  );

  return router;
}
