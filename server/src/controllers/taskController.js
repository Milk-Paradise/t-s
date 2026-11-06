import { taskModel } from '../models/taskModel.js';
import { taskSchema, pageSchema, idSchema } from '../validation.js';
import { notFound } from '../middleware/errors.js';

export async function listTasks(req, res) {
  const projectId = idSchema.parse(req.query.projectId);
  const { limit, offset } = pageSchema.parse(req.query);
  res.json(await taskModel.list(projectId, limit, offset));
}
export async function getTask(req, res) {
  res.json(notFound(await taskModel.get(idSchema.parse(req.params.id))));
}
export async function createTask(req, res) {
  res.status(201).json(await taskModel.create(taskSchema.parse(req.body)));
}
export async function updateTask(req, res) {
  res.json(notFound(await taskModel.update(idSchema.parse(req.params.id), taskSchema.parse(req.body))));
}
export async function deleteTask(req, res) {
  notFound(await taskModel.remove(idSchema.parse(req.params.id)));
  res.sendStatus(204);
}
