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
  const res = await db.raw("SELECT CURRENT_TIMESTAMP;");
  if (res.rows.length) {
    console.log("initialized database...");
  }
  return db;
}

export async function InitV3RedisCache(connStr) {
  const redisClient = createClient({
    legacyMode: true,
    url: connStr,
  });
  await redisClient.connect();
  return redisClient;
}

export async function InitV4RedisCache(connStr) {
  const redisClient = createClient({
    url: connStr,
  });
  await redisClient.connect();
  return redisClient;
}
