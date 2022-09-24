import { Router } from "express";
import bcrypt from "bcrypt";
import { UserModel, UserService } from "./auth.model.js";
import Joi from "joi";
import { InitPassportStrategies } from "./passport.config.js";
import passport from "passport";

export default function (db) {
  const router = Router();
  const users = new UserService(db);
  const userLoginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }).unknown();

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

      await users.insert(
        UserModel.CreateWithBasicAuth(email, hashed_pwd, salt, "user")
      );
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

  // router.post("/login", async (req, res) => {
  //   try {
  //     const validation = userLoginSchema.validate(req.body);
  //     if (validation.error) {
  //       console.error(validation.error);
  //       res.status(400).json({
  //         error: "invalid user input",
  //       });
  //       return;
  //     }
  //     const { email, password: userPassword } = req.body;
  //     const user = await users.getByEmail(email);
  //     if (!user) {
  //       res.status(400).json({
  //         error: `user ${email} does not exists`,
  //       });
  //       return;
  //     }
  //     if (!(await bcrypt.compare(userPassword, user.password))) {
  //       res.status(400).json({
  //         error: "invalid user credentials",
  //       });
  //     }

  //     const { password, salt, ...userDTO } = user;
  //     req.session.user = userDTO;
  //     res.status(200).json({
  //       message: "successfully logged in",
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     res.sendStatus(500);
  //   }
  // });

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
