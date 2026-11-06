import { test } from "node:test";
import assert from "node:assert/strict";

test(
  "PostgreSQL: CRUD, пагинация и ограничения связей",
  { skip: !process.env.TEST_DATABASE_URL },
  async () => {
    // Только отдельная тестовая БД с таблицами из init-db.sql.
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
    const { projectModel } = await import("../src/models/projectModel.js");
    const { taskModel } = await import("../src/models/taskModel.js");
    const { pgp } = await import("../src/db.js");
    let project;
    let otherProject;
    let task;
    try {
      project = await projectModel.create({
        name: "Integration test",
        budget: 12.34,
        start_date: "2026-11-04",
        team_size: 2,
      });
      otherProject = await projectModel.create({
        name: "Target project",
        budget: 0,
        start_date: "2026-11-05",
        team_size: 1,
      });
      assert.equal(project.start_date, "2026-11-04");
      assert.equal(
        (await projectModel.get(project.id)).name,
        "Integration test",
      );
      assert.equal(
        (await projectModel.update(project.id, { ...project, name: "Updated" }))
          .name,
        "Updated",
      );
      const first = await projectModel.list(1, 0);
      const second = await projectModel.list(1, 1);
      assert.equal(first.items.length, 1);
      assert.notEqual(first.items[0].id, second.items[0].id);
      task = await taskModel.create({
        project_id: project.id,
        title: "Test task",
        cost: 1.25,
        due_date: "2026-12-01",
        priority: 1,
      });
      assert.equal((await taskModel.get(task.id)).project_id, project.id);
      assert.equal((await taskModel.list(project.id, 50, 0)).total, 1);
      await assert.rejects(projectModel.remove(project.id), (error) =>
        ["23503", "23001"].includes(error.code),
      );
      await taskModel.update(task.id, { ...task, project_id: otherProject.id });
      assert.equal((await taskModel.list(project.id, 50, 0)).total, 0);
      await assert.rejects(
        taskModel.create({ ...task, project_id: 2147483647 }),
        (error) => error.code === "23503",
      );
      await taskModel.remove(task.id);
      task = null;
      assert.equal(await taskModel.get(-1), null);
    } finally {
      if (task) await taskModel.remove(task.id);
      if (project) await projectModel.remove(project.id);
      if (otherProject) await projectModel.remove(otherProject.id);
      pgp.end();
    }
  },
);
