import { projectModel } from "../models/projectModel.js";
import { projectSchema, pageSchema, idSchema } from "../validation.js";
import { notFound } from "../middleware/errors.js";

export async function listProjects(req, res) {
  const { limit, offset } = pageSchema.parse(req.query);
  res.json(await projectModel.list(limit, offset));
}
export async function getProject(req, res) {
  res.json(notFound(await projectModel.get(idSchema.parse(req.params.id))));
}
export async function createProject(req, res) {
  res
    .status(201)
    .json(await projectModel.create(projectSchema.parse(req.body)));
}
export async function updateProject(req, res) {
  res.json(
    notFound(
      await projectModel.update(
        idSchema.parse(req.params.id),
        projectSchema.parse(req.body),
      ),
    ),
  );
}
export async function deleteProject(req, res) {
  notFound(await projectModel.remove(idSchema.parse(req.params.id)));
  res.sendStatus(204);
}
