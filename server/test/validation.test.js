import { test } from "node:test";
import assert from "node:assert/strict";
import { pageSchema, taskSchema, projectSchema } from "../src/validation.js";

test("пагинация принимает только целые значения с ограниченным размером блока", () => {
  assert.deepEqual(pageSchema.parse({}), { limit: 50, offset: 0 });
  for (const value of [
    { limit: 101 },
    { limit: 0 },
    { offset: -1 },
    { offset: "0; DROP TABLE projects" },
  ]) {
    assert.equal(pageSchema.safeParse(value).success, false);
  }
});
test("проект: название, календарная дата, точность денег и размер команды", () => {
  const project = {
    name: "  Проект  ",
    budget: 1500.25,
    start_date: "2026-11-04",
    team_size: 3,
  };
  assert.equal(projectSchema.parse(project).name, "Проект");
  for (const value of [
    { name: " " },
    { start_date: "2026-02-30" },
    { budget: -1 },
    { budget: 1.001 },
    { team_size: 1.5 },
  ]) {
    assert.equal(
      projectSchema.safeParse({ ...project, ...value }).success,
      false,
    );
  }
});
test("задача требует корректный foreign key и допустимый приоритет", () => {
  const task = {
    project_id: 1,
    title: "Подключить API",
    cost: 0,
    due_date: "2026-12-01",
    priority: 2,
  };
  assert.equal(taskSchema.safeParse(task).success, true);
  for (const value of [
    { project_id: 0 },
    { project_id: "1" },
    { priority: 4 },
  ]) {
    assert.equal(taskSchema.safeParse({ ...task, ...value }).success, false);
  }
});
