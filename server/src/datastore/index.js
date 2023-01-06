import Joi from "joi";
import knex from "knex";
import { createClient } from "redis";

// singleton connection pool handler
let db;
const dbOptionSchema = Joi.object({
  client: Joi.string().min(2).required(),
  connection: Joi.object({
    host: Joi.string(),
    port: Joi.number(),
    user: Joi.string(),
    password: Joi.string(),
    database: Joi.string(),
  }).required(),
});

export async function InitDb(dbOptions) {
  if (!dbOptions) {
    return null;
  }
  if (!dbOptionSchema.validate(dbOptions)) {
    return null;
  }
  if (db) {
    return db;
  }
  db = knex(dbOptions);
  await db.raw("SELECT CURRENT_TIMESTAMP;");
  return db;
}

export async function InitRedisCache(connStr, legacyMode = false) {
  const redisClient = createClient({
    legacyMode,
    url: connStr,
  });
  await redisClient.connect();
  return redisClient;
}
