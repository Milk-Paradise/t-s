import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { request, saveRecord } from "../api/http";

export default function RecordForm({
  kind,
  record,
  project,
  onClose,
  onSaved,
}) {
  const isTask = kind === "tasks";
  const dialog = useRef(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [targetProject, setTargetProject] = useState(project);
  const [projectId, setProjectId] = useState(
    String(record?.project_id || project?.id || ""),
  );
  const [checking, setChecking] = useState(false);
  const [values, setValues] = useState(
    record ||
      (isTask
        ? {
            title: "",
            cost: 0,
            due_date: new Date().toISOString().slice(0, 10),
            priority: 2,
          }
        : {
            name: "",
            budget: 0,
            start_date: new Date().toISOString().slice(0, 10),
            team_size: 1,
          }),
  );

  useEffect(() => {
    dialog.current.showModal();
  }, []);
  const change = (event) =>
    setValues((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  async function checkProject() {
    setChecking(true);
    setError("");
    setTargetProject(null);
    try {
      setTargetProject(await request(`/projects/${Number(projectId)}`));
    } catch (error) {
      setError(error.message);
    } finally {
      setChecking(false);
    }
  }
  async function submit(event) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (isTask && (!targetProject || targetProject.id !== Number(projectId)))
        throw new Error("Сначала проверьте выбранный проект");
      const data = isTask
        ? {
            title: values.title,
            cost: Number(values.cost),
            due_date: values.due_date,
            priority: Number(values.priority),
            project_id: targetProject.id,
          }
        : {
            name: values.name,
            budget: Number(values.budget),
            start_date: values.start_date,
            team_size: Number(values.team_size),
          };
      const saved = await saveRecord(kind, record?.id, data);
      onSaved(saved);
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="modal"
      onCancel={(event) => {
        if (saving) event.preventDefault();
        else onClose();
      }}
    >
      <form onSubmit={submit}>
        <div className="modal-heading">
          <h2>
            {record ? "Редактирование" : "Новая запись"}:{" "}
            {isTask ? "задача" : "проект"}
          </h2>
          <button
            type="button"
            className="icon-button"
            aria-label="Закрыть"
            disabled={saving}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <label>
          {isTask ? "Название задачи" : "Название проекта"}
          <input
            autoFocus
            required
            maxLength={isTask ? 160 : 120}
            name={isTask ? "title" : "name"}
            value={isTask ? values.title : values.name}
            onChange={change}
          />
        </label>
        {isTask && (
          <div className="project-picker">
            <label>
              ID проекта
              <input
                type="number"
                required
                min="1"
                value={projectId}
                onChange={(event) => {
                  setProjectId(event.target.value);
                  setTargetProject(null);
                }}
              />
            </label>
            <button
              type="button"
              className="button"
              disabled={checking || saving}
              onClick={checkProject}
            >
              {checking ? "Проверка…" : "Проверить проект"}
            </button>
            <small>
              {targetProject
                ? `Выбран: ${targetProject.name}`
                : "Укажите ID из главной таблицы и нажмите «Проверить проект»."}
            </small>
          </div>
        )}
        <div className="form-row">
          <label>
            {isTask ? "Стоимость, ₽" : "Бюджет, ₽"}
            <input
              required
              type="number"
              min="0"
              max="999999999.99"
              step="0.01"
              name={isTask ? "cost" : "budget"}
              value={isTask ? values.cost : values.budget}
              onChange={change}
            />
          </label>
          <label>
            {isTask ? "Срок" : "Дата начала"}
            <input
              required
              type="date"
              name={isTask ? "due_date" : "start_date"}
              value={(isTask ? values.due_date : values.start_date).slice(
                0,
                10,
              )}
              onChange={change}
            />
          </label>
        </div>
        {isTask ? (
          <label>
            Приоритет
            <select name="priority" value={values.priority} onChange={change}>
              <option value="1">Высокий</option>
              <option value="2">Средний</option>
              <option value="3">Низкий</option>
            </select>
          </label>
        ) : (
          <label>
            Участников команды
            <input
              required
              type="number"
              min="1"
              max="10000"
              step="1"
              name="team_size"
              value={values.team_size}
              onChange={change}
            />
          </label>
        )}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="modal-footer">
          <button
            type="button"
            className="button"
            disabled={saving}
            onClick={onClose}
          >
            Отмена
          </button>
          <button className="button primary" disabled={saving || checking}>
            {saving ? "Сохранение…" : "Сохранить"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
