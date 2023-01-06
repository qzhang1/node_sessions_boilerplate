import dotenv from "dotenv";
import express from "express";
import axios from "axios";
import pino from "pino";
import pinoEcsFormatter from "@elastic/ecs-pino-format";
import { resolve, join } from "path";

import InitMiddleware from "./middleware/index.js";
import { InitDb, InitRedisCache } from "./datastore/index.js";
import InitRoutes from "./routes.js";
import Joi from "joi";
import { ErrorHandle, NotFound404 } from "./middleware/error-handling.js";
import StockService from "./modules/stocks/stock.service.js";
import { UserService } from "./modules/user/user.service.js";
import { InitMetrics, HttpMetricMiddleware } from "./shared/metrics/index.js";
import { InitPassportStrategies } from "./modules/auth/passport.config.js";

function init() {
  return new Promise((res, rej) => {
    // select correct .env and load it
    const rootDir = resolve("./");
    const envSchema = Joi.object({
      SALT_ROUNDS: Joi.number(),
      REDIS_PASSWORD: Joi.string().required(),
      POSTGRES_HOST: Joi.string().required(),
      POSTGRES_USER: Joi.string().required(),
      POSTGRES_PASSWORD: Joi.string().required(),
      POSTGRES_DB: Joi.string().required(),
      APP_PORT: Joi.number(),
      SESSION_SECRET: Joi.string().required(),
      COOKIE_SECRET: Joi.string().required(),
      GOOGLE_OAUTH_CLIENT_ID: Joi.string().required(),
      GOOGLE_OAUTH_CLIENT_SECRET: Joi.string().required(),
    }).unknown();
    const env = process.env.NODE_ENV === "production" ? "prod.env" : "dev.env";
    const envPath = join(rootDir, env);
    dotenv.config({ path: envPath });
    const validateRes = envSchema.validate(process.env);
    if (validateRes.error) {
      console.error(validateRes.error);
      process.exit(1);
    }
    res();
  });
}

function initGracefulShutdown(server, logger, persistentConnections) {
  const signals = ["SIGINT", "SIGTERM", "SIGQUIT"];
  signals.forEach((signal) => {
    process.on(signal, () => {
      logger.info("initiating graceful shutdown...");
      server.close(() => {
        logger.info(
          "server shutdown complete, closing persistent connections..."
        );
        const { db, sessionCache, dataCache } = persistentConnections;
        Promise.allSettled([
          db.destroy(),
          sessionCache.disconnect(),
          dataCache.disconnect(),
        ])
          .then((results) => {
            logger.info(results, "finished closing persistent connections");
          })
          .finally(() => {
            process.exit(0);
          });
      });
    });
  });
}

async function bootstrap() {
  const logger = pino(
    pinoEcsFormatter({
      level: "debug",
      colorize: true,
    })
  );
  try {
    const app = express();

    // initialize dependencies
    logger.info("initializing app dependencies...");
    const dbOptions = {
      client: "pg",
      connection: {
        host: process.env.POSTGRES_HOST,
        port: process.env.POSTGRES_PORT || 5432,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
      },
    };
    const db = await InitDb(dbOptions);
    const connStr = `redis://:${process.env.REDIS_PASSWORD}@localhost:6379`;
    const sessionCache = await InitRedisCache(connStr, true);
    const dataCache = await InitRedisCache(connStr);
    const stockApiKey = process.env.ALPHA_VANTAGE_API_KEY;
    const alphaClient = axios.create({
      baseURL: process.env.ALPHA_VANTAGE_BASE_URL,
      timeout: parseInt(process.env.ALPHA_VANTAGE_HTTP_TIMEOUT),
    });
    const stockService = new StockService(stockApiKey, alphaClient, dataCache);
    const userService = new UserService(db);
    const dependencies = {
      db,
      stockService,
      userService,
    };
    logger.info("initializing app middleware...");
    // pass dependencies to app middleware and routes
    InitPassportStrategies(userService);
    await InitMiddleware(app, sessionCache);
    logger.info("initializing routes...");
    const router = InitRoutes(dependencies);

    if (process.env.ENABLE_METRICS === "true") {
      logger.debug("initializing metrics...");
      const { metrics, httpRequestDurationMicroseconds } = InitMetrics();
      app.get("/metrics", async (req, res) => {
        res.setHeader("Content-Type", metrics.contentType);
        const results = await metrics.metrics();
        res.end(results);
      });
      app.use(HttpMetricMiddleware(httpRequestDurationMicroseconds));
    }

    app.use("/api", router);
    // important to attach these after routes to catch errors
    app.use(NotFound404);
    app.use(ErrorHandle);
    await app.listen(process.env.APP_PORT);
    const persistentConnections = {
      db,
      sessionCache,
      dataCache,
    };
    initGracefulShutdown(app, logger, persistentConnections);
    logger.info(`Server ready at port ${process.env.APP_PORT}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

init()
  .then(bootstrap)
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
