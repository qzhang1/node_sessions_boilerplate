import { Router } from "express";
import bcrypt from "bcrypt";
import { UserModel, UserService } from "../../datastore/user.service.js";
import Joi from "joi";
import { InitPassportStrategies } from "./passport.config.js";
import passport from "passport";

export default function (db) {
  const router = Router();
  const users = new UserService(db);

  InitPassportStrategies(users);

  router.post("/signup", async (req, res) => {
    try {
      const { email, password } = req.body;
      const existingUser = await users.getByEmail(email);
      if (existingUser) {
        res.json({
          message: `user ${email} already exists`,
        });
        return;
      }

      const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS));
      const hashed_pwd = await bcrypt.hash(password, salt);

      const err = await users.insert(
        UserModel.CreateWithBasicAuth(email, hashed_pwd, salt, "user")
      );
      if (err) {
        throw new Error(err);
      }
      res.json({
        message: `user ${email} has successfully registered`,
      });
    } catch (err) {
      console.error(err);
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
