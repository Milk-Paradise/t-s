import { test, before, after } from "node:test";
import assert from "node:assert/strict";

// Эти проверки завершаются до обращения к БД: проверяем реальный HTTP-слой.
process.env.DATABASE_URL ||=
  "postgres://postgres:postgres@127.0.0.1:5432/project_desk";
const { app } = await import("../src/app.js");
const { pgp } = await import("../src/db.js");
let server;
let base;
before(async () => {
  server = await new Promise((resolve) => {
    const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
  });
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise((resolve) => server.close(resolve));
  pgp.end();
});
test("невалидные данные и параметры возвращают 400", async () => {
  for (const path of [
    "/api/projects?limit=500",
    "/api/projects/abc",
    "/api/tasks?projectId=-1",
  ]) {
    assert.equal((await fetch(base + path)).status, 400);
  }
  const response = await fetch(base + "/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).message, /Проверьте поля/);
});
test("неизвестный маршрут и сломанный JSON обрабатываются", async () => {
  assert.equal((await fetch(base + "/api/missing")).status, 404);
  const response = await fetch(base + "/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
  assert.equal(response.status, 400);
});
