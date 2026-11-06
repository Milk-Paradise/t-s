import { db } from "../db.js";

export const projectModel = {
  list: (limit, offset) =>
    db.tx(async (t) => {
      const items = await t.any(
        "SELECT * FROM projects ORDER BY id LIMIT $1 OFFSET $2",
        [limit, offset],
      );
      const { total } = await t.one(
        "SELECT count(*)::int AS total FROM projects",
      );
      return { items, total };
    }),
  get: (id) => db.oneOrNone("SELECT * FROM projects WHERE id = $1", [id]),
  create: (data) =>
    db.one(
      "INSERT INTO projects(name, budget, start_date, team_size) VALUES(${name}, ${budget}, ${start_date}, ${team_size}) RETURNING *",
      data,
    ),
  update: (id, data) =>
    db.oneOrNone(
      "UPDATE projects SET name=${name}, budget=${budget}, start_date=${start_date}, team_size=${team_size} WHERE id=${id} RETURNING *",
      { ...data, id },
    ),
  remove: (id) =>
    db.oneOrNone("DELETE FROM projects WHERE id=$1 RETURNING id", [id]),
};
