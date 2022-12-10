import Joi from "joi";
import knex from "knex";

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

export default async function InitDb(dbOptions) {
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
