import { create } from "zustand";

export const useDeskStore = create((set) => ({
  selectedProject: null,
  selectedTask: null,
  selectProject: (project) =>
    set({ selectedProject: project, selectedTask: null }),
  selectTask: (task) => set({ selectedTask: task }),
}));
