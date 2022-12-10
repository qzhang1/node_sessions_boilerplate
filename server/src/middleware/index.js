import express from "express";
import session from "express-session";
import connectRedis from "connect-redis";
import { createClient } from "redis";
import passport from "passport";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";

const redisStore = connectRedis(session);

export default async function (app) {
  const clientUrl = process.env.APP_CLIENT_URL;
  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: true,
    })
  );
  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.use(morgan("dev"));
  app.use(helmet());
  app.use(
    cors({
      origin: clientUrl,
      credentials: true,
    })
  );

  const connStr = `redis://:${process.env.REDIS_PASSWORD}@localhost:6379/0`;
  const redisClient = createClient({
    legacyMode: true,
    url: connStr,
  });
  await redisClient.connect();

  app.use(
    session({
      store: new redisStore({ client: redisClient }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 10, // 10 min
      },
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
}
