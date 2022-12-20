import dotenv from "dotenv";
import express from "express";
import axios from "axios";
import { resolve, join } from "path";

import InitMiddleware from "./middleware/index.js";
import {
  InitDb,
  InitV3RedisCache,
  InitV4RedisCache,
} from "./datastore/index.js";
import InitRoutes from "./routes.js";
import Joi from "joi";
import { ErrorHandle, NotFound404 } from "./middleware/error-handling.js";
import StockService from "./modules/stocks/stock.service.js";

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

async function bootstrap() {
  try {
    const connStr = `redis://:${process.env.REDIS_PASSWORD}@localhost:6379`;
    const app = express();
    // initialize dependencies
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
    const sessionCache = await InitV3RedisCache(connStr);
    const responseCache = await InitV4RedisCache(connStr);
    const stockApiKey = process.env.ALPHA_VANTAGE_API_KEY;
    const alphaClient = axios.create({
      baseURL: process.env.ALPHA_VANTAGE_BASE_URL,
      timeout: parseInt(process.env.ALPHA_VANTAGE_HTTP_TIMEOUT),
    });
    const stockService = new StockService(
      stockApiKey,
      alphaClient,
      responseCache
    );
    const dependencies = {
      db,
      stockService,
    };
    // pass dependencies to app middleware and routes
    await InitMiddleware(app, sessionCache);
    const router = InitRoutes(dependencies);
    app.use("/api", router);
    // important to attach these after routes to catch errors
    app.use(NotFound404);
    app.use(ErrorHandle);
    await app.listen(process.env.APP_PORT);
    console.log(`Server ready at port ${process.env.APP_PORT}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

bootstrap();
