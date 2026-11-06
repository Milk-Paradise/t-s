import "dotenv/config";
import pgPromise from "pg-promise";

if (!process.env.DATABASE_URL)
  throw new Error("Задайте DATABASE_URL в server/.env");
export const pgp = pgPromise();
// DATE — календарная дата, не момент времени. Не переводим её в часовой пояс.
pgp.pg.types.setTypeParser(1082, (value) => value);
export const db = pgp(process.env.DATABASE_URL);
