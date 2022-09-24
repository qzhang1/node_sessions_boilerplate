import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import passport from "passport";
import bcrypt from "bcrypt";

import { UserModel } from "./auth.model.js";

const PROVIDERS = {
  GOOGLE: "google",
};

/**
 *
 * @param {UserService} userService
 */
export function InitPassportStrategies(userService) {
  // serialize into cache for session storage, keep it light
  passport.serializeUser((user, cb) => {
    const { password, salt, provider, provider_id, ...res } = user;
    cb(null, res);
  });

  passport.deserializeUser(async (user, cb) => {
    try {
      const deserializeUser = await userService.getById(user.id);
      const { password, salt, ...res } = deserializeUser;
      if (!res) {
        cb(new Error(`user ${res.email} can not be found`), false);
      }
      cb(null, res);
    } catch (err) {
      cb(err, null);
    }
  });

  // local strategy
  const verifyIdentity = async (email, password, done) => {
    const user = await userService.getByEmail(email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return done(null, false, { message: "Invalid credientials" });
    }
    return done(null, user);
  };
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      verifyIdentity
    )
  );

  /**
   * google oauth passport strategy, on google login success, verify if user already exists or
   * should create user with oauth permissions
   * @param {*} req
   * @param {*} accessToken
   * @param {*} refreshToken
   * @param {*} profile
   * @param {*} cb
   * @returns
   */
  const oauthVerifyIdentity = async (
    req,
    accessToken,
    refreshToken,
    profile,
    cb
  ) => {
    /**
     * 3 scenarios
     * - user not registered, becomes oauth registered
     * - user already registered, does not have provider info then update record, can login either way
     * - user already oauth registered, it's all good
     */
    try {
      const existingUser = await userService.getByProviderId(profile.id);
      if (existingUser) {
        return cb(null, existingUser);
      }

      const newUser = UserModel.CreateWithOauth(
        profile.emails[0].value,
        PROVIDERS.GOOGLE,
        profile.id,
        "user"
      );
      await userService.insert(newUser);
      const user = await userService.getByProviderId(profile.id);
      return cb(null, user);
    } catch (err) {
      cb(err, null);
    }
  };
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
        clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        callbackURL: "http://localhost:4004/api/auth/google/callback",
        passReqToCallback: true,
      },
      oauthVerifyIdentity
    )
  );
}
