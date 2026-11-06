import { app } from "./app.js";
import { db, pgp } from "./db.js";

try {
  await db.one("SELECT 1 AS connected");
  const server = app.listen(process.env.PORT || 3001, "127.0.0.1", () =>
    console.log(`API: http://localhost:${process.env.PORT || 3001}`),
  );
  const shutdown = () =>
    server.close(() => {
      pgp.end();
      process.exit(0);
    });
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  server.on("error", (error) => {
    console.error(error.message);
    pgp.end();
    process.exit(1);
  });
} catch (error) {
  console.error("Не удалось подключиться к PostgreSQL:", error.message);
  pgp.end();
  process.exit(1);
}
