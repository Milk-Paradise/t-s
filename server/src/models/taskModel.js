import { db } from "../db.js";

export const taskModel = {
  list: (projectId, limit, offset) =>
    db.tx(async (t) => {
      const items = await t.any(
        "SELECT * FROM tasks WHERE project_id=$1 ORDER BY id LIMIT $2 OFFSET $3",
        [projectId, limit, offset],
      );
      const { total } = await t.one(
        "SELECT count(*)::int AS total FROM tasks WHERE project_id=$1",
        [projectId],
      );
      return { items, total };
    }),
  get: (id) => db.oneOrNone("SELECT * FROM tasks WHERE id=$1", [id]),
  create: (data) =>
    db.one(
      "INSERT INTO tasks(project_id, title, cost, due_date, priority) VALUES(${project_id}, ${title}, ${cost}, ${due_date}, ${priority}) RETURNING *",
      data,
    ),
  update: (id, data) =>
    db.oneOrNone(
      "UPDATE tasks SET project_id=${project_id}, title=${title}, cost=${cost}, due_date=${due_date}, priority=${priority} WHERE id=${id} RETURNING *",
      { ...data, id },
    ),
  remove: (id) =>
    db.oneOrNone("DELETE FROM tasks WHERE id=$1 RETURNING id", [id]),
};
