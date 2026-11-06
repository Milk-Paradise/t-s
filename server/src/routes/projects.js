import { Router } from "express";
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";
export const projectsRouter = Router();
projectsRouter.get("/", listProjects);
projectsRouter.get("/:id", getProject);
projectsRouter.post("/", createProject);
projectsRouter.put("/:id", updateProject);
projectsRouter.delete("/:id", deleteProject);
