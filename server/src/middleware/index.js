import express from "express";
import session from "express-session";
import connectRedis from "connect-redis";
import passport from "passport";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import pinoHttp from "pino-http";

const redisStore = connectRedis(session);

export default async function (app, redisClient, logger) {
  const clientUrl = process.env.APP_CLIENT_URL;
  const payloadLimit = process.env.APP_PAYLOAD_LIMIT || "50mb";
  app.use(
    express.json({
      limit: payloadLimit,
    })
  );
  app.use(
    express.urlencoded({
      extended: true,
    })
  );
  app.use(cookieParser(process.env.COOKIE_SECRET));

  app.use(
    pinoHttp({
      logger,
    })
  );
  app.use(helmet());
  app.use(
    cors({
      origin: clientUrl,
      credentials: true,
      methods: ["GET", "POST"],
    })
  );

  app.use(
    session({
      store: new redisStore({ client: redisClient }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: parseInt(process.env.COOKIE_TTL, 10), // 1 hour
      },
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
}
