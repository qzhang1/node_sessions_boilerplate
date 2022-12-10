import dotenv from "dotenv";
import express from "express";
import { resolve, join } from "path";

import InitMiddleware from "./middleware/index.js";
import InitDb from "./datastore/index.js";
import InitRoutes from "./routes.js";
import Joi from "joi";
import { ErrorHandle, NotFound404 } from "./middleware/error-handling.js";

// select correct .env and load it
const rootDir = resolve("./");
const envSchema = Joi.object({
  SALT_ROUNDS: Joi.number(),
  REDIS_PASSWORD: Joi.string().required(),
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
}

const dbOptions = {
  client: "pg",
  connection: {
    host: "127.0.0.1",
    port: 5432,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  },
};
console.log(dbOptions);
async function bootstrap() {
  try {
    const app = express();
    // middleware
    const db = await InitDb(dbOptions);
    await InitMiddleware(app);
    InitRoutes(app, db);
    // important to attach these after routes to catch errors
    app.use(NotFound404);
    app.use(ErrorHandle);
    await app.listen(process.env.APP_PORT);
    console.log(`Server ready at port ${process.env.APP_PORT}`);
  } catch (err) {
    console.error(err);
  }
}

bootstrap();
