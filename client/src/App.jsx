import { useCallback, useEffect, useState } from "react";
import {
  LayoutDashboard,
  Layers,
  BookOpen,
  ArrowUpRight,
  FolderKanban,
  Users,
  ListTodo,
  RefreshCw,
} from "lucide-react";
import { request } from "./api/http";
import { useDeskStore } from "./store/useDeskStore";
import ProjectsGrid from "./components/ProjectsGrid";
import TasksGrid from "./components/TasksGrid";
import Toolbar from "./components/Toolbar";
import RecordForm from "./components/RecordForm";

export default function App() {
  const { selectedProject, selectedTask, selectProject, selectTask } =
    useDeskStore();
  const [page, setPage] = useState("desk");
  const [total, setTotal] = useState(0);
  const [revision, setRevision] = useState(0);
  const [taskRevision, setTaskRevision] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [taskTotal, setTaskTotal] = useState(0);
  const [taskPage, setTaskPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [projectError, setProjectError] = useState("");
  const [form, setForm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const clearProjectError = useCallback(() => setProjectError(""), []);

  useEffect(() => {
    if (!selectedProject) {
      setTasks([]);
      setTaskTotal(0);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setTasks([]);
    selectTask(null);
    setError("");
    request(
      `/tasks?projectId=${selectedProject.id}&limit=50&offset=${taskPage * 50}`,
      { signal: controller.signal },
    )
      .then((data) => {
        setTasks(data.items);
        setTaskTotal(data.total);
      })
      .catch((error) => {
        if (error.name !== "AbortError") setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [selectedProject?.id, taskPage, taskRevision, selectTask]);

  // При смене проекта не сохраняем номер страницы его предшественника.
  useEffect(() => {
    setTaskPage(0);
  }, [selectedProject?.id]);

  function refreshProjects() {
    selectProject(null);
    setRevision((value) => value + 1);
  }
  function saved() {
    if (form.kind === "projects") refreshProjects();
    else {
      selectTask(null);
      setTaskPage(0);
      setTaskRevision((value) => value + 1);
    }
  }
  async function remove(kind, record) {
    if (
      !window.confirm(
        `Удалить ${kind === "projects" ? "проект" : "задачу"} «${record.name || record.title}»?`,
      )
    )
      return;
    setDeleting(true);
    setError("");
    try {
      await request(`/${kind}/${record.id}`, { method: "DELETE" });
      if (kind === "projects") refreshProjects();
      else {
        selectTask(null);
        setTaskPage(0);
        setTaskRevision((value) => value + 1);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setDeleting(false);
    }
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Project Desk">
          <span className="brand-mark">
            <Layers size={22} />
          </span>
          project<span className="brand-light">desk</span>
          <span className="brand-dot">.</span>
        </a>
        <div className="workspace">
          <span className="avatar">PD</span>
          <div>
            <strong>Рабочее пространство</strong>
            <small>Управление проектами</small>
          </div>
        </div>
        <p className="nav-caption">РАБОЧАЯ ОБЛАСТЬ</p>
        <nav>
          {[
            { id: "desk", label: "Проекты и задачи", icon: LayoutDashboard },
            { id: "overview", label: "Обзор проекта", icon: FolderKanban },
            { id: "help", label: "Как пользоваться", icon: BookOpen },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item ${page === id ? "active" : ""}`}
              onClick={() => setPage(id)}
            >
              <Icon size={19} />
              {label}
              {id === "desk" && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="online-dot" /> Локальное приложение
          <small>React + Node.js + PostgreSQL</small>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <span>
            Рабочее пространство{" "}
            <span className="breadcrumb">
              /{" "}
              {page === "desk"
                ? "Проекты и задачи"
                : page === "overview"
                  ? "Обзор проекта"
                  : "Справка"}
            </span>
          </span>
          <span className="topbar-label">
            PROJECT MANAGEMENT <span className="avatar small">A</span>
          </span>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <p className="eyebrow">ВАШ РАБОЧИЙ ДЕНЬ ПОД КОНТРОЛЕМ</p>
              <h1>
                {page === "desk"
                  ? "Проекты и задачи"
                  : page === "overview"
                    ? "Обзор проекта"
                    : "Как пользоваться"}
              </h1>
              <p className="subtitle">
                Все проекты, команды и задачи — в одном пространстве.
              </p>
            </div>
            {page === "desk" && (
              <button
                className="button"
                onClick={() => {
                  refreshProjects();
                  setError("");
                }}
              >
                <RefreshCw size={15} />
                Обновить
              </button>
            )}
          </div>
          {page === "desk" ? (
            <>
              <div className="stats">
                <Stat
                  icon={FolderKanban}
                  label="Всего проектов"
                  value={total || "—"}
                  detail="В рабочем пространстве"
                  color="purple"
                />
                <Stat
                  icon={ListTodo}
                  label="Задачи проекта"
                  value={selectedProject ? taskTotal : "—"}
                  detail={
                    selectedProject
                      ? `Проект #${selectedProject.id}`
                      : "Выберите проект в таблице"
                  }
                  color="blue"
                />
                <Stat
                  icon={Users}
                  label="Команда проекта"
                  value={
                    selectedProject ? `${selectedProject.team_size} чел.` : "—"
                  }
                  detail="Участники выбранного проекта"
                  color="green"
                />
              </div>
              {error && (
                <div role="alert" className="error global-error">
                  {error}
                  <button
                    className="text-button"
                    onClick={() => setTaskRevision((value) => value + 1)}
                  >
                    Повторить загрузку задач
                  </button>
                </div>
              )}
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>
                      Проекты <span className="count">{total}</span>
                    </h2>
                    <p>Выберите строку, чтобы увидеть связанные задачи</p>
                  </div>
                  <span className="subtle-tag">
                    По 50 записей при прокрутке
                  </span>
                </div>
                <Toolbar
                  selected={selectedProject}
                  disabled={deleting}
                  onAdd={() => setForm({ kind: "projects" })}
                  onEdit={() =>
                    setForm({ kind: "projects", record: selectedProject })
                  }
                  onDelete={() => remove("projects", selectedProject)}
                />
                {projectError && (
                  <div role="alert" className="error grid-error">
                    {projectError}
                    <button className="text-button" onClick={refreshProjects}>
                      Повторить
                    </button>
                  </div>
                )}
                <ProjectsGrid
                  revision={revision}
                  onTotal={setTotal}
                  onError={setProjectError}
                  onLoaded={clearProjectError}
                />
                <div className="panel-footer">
                  <span>
                    <span className="online-dot" /> Данные из PostgreSQL
                  </span>
                  <span>
                    Нажмите на строку для выбора <ArrowUpRight size={13} />
                  </span>
                </div>
              </section>
              <section className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>
                      Задачи{" "}
                      {selectedProject && (
                        <span className="count">{taskTotal}</span>
                      )}
                    </h2>
                    <p>
                      {selectedProject
                        ? selectedProject.name
                        : "Задачи выбранного проекта появятся здесь"}
                    </p>
                  </div>
                  {selectedProject && (
                    <span className="subtle-tag">
                      Проект #{selectedProject.id}
                    </span>
                  )}
                </div>
                <Toolbar
                  selected={selectedTask}
                  disabled={!selectedProject || deleting || loading}
                  onAdd={() => setForm({ kind: "tasks" })}
                  onEdit={() =>
                    setForm({ kind: "tasks", record: selectedTask })
                  }
                  onDelete={() => remove("tasks", selectedTask)}
                />
                {selectedProject ? (
                  <TasksGrid
                    key={selectedProject.id}
                    tasks={tasks}
                    loading={loading}
                  />
                ) : (
                  <div className="empty-state">
                    <span className="empty-icon">
                      <ListTodo size={27} />
                    </span>
                    <h3>Сначала выберите проект</h3>
                    <p>Его задачи и действия с ними появятся в этой таблице.</p>
                  </div>
                )}
                {selectedProject && (
                  <div className="panel-footer">
                    <span>Всего задач: {taskTotal}</span>
                    <div className="pagination">
                      <button
                        className="button"
                        disabled={taskPage === 0 || loading}
                        onClick={() => setTaskPage((value) => value - 1)}
                      >
                        Назад
                      </button>
                      <span>Страница {taskPage + 1}</span>
                      <button
                        className="button"
                        disabled={(taskPage + 1) * 50 >= taskTotal || loading}
                        onClick={() => setTaskPage((value) => value + 1)}
                      >
                        Вперёд
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </>
          ) : page === "overview" ? (
            <section className="panel info-panel">
              <h2>{selectedProject?.name || "Проект пока не выбран"}</h2>
              {selectedProject ? (
                <>
                  <p>Команда: {selectedProject.team_size} чел.</p>
                  <p>Дата начала: {selectedProject.start_date}</p>
                  <p>Задач в проекте: {taskTotal}</p>
                  <button
                    className="button primary"
                    onClick={() => setPage("desk")}
                  >
                    Вернуться к задачам
                  </button>
                </>
              ) : (
                <p>
                  Откройте «Проекты и задачи» и выберите строку в первой
                  таблице.
                </p>
              )}
            </section>
          ) : (
            <section className="panel info-panel">
              <h2>От проекта к задаче</h2>
              <ol>
                <li>
                  Выберите проект в верхней таблице. Прокрутка загружает
                  следующие записи с сервера.
                </li>
                <li>
                  В нижней таблице выберите задачу для изменения или удаления.
                </li>
                <li>
                  Для новой записи нажмите «Добавить запись» и заполните форму.
                </li>
                <li>
                  При переносе задачи укажите ID другого проекта и проверьте его
                  кнопкой в форме.
                </li>
                <li>
                  Проект с задачами удалить нельзя: сначала перенесите или
                  удалите его задачи.
                </li>
              </ol>
              <p>
                Подробное объяснение кода и запуска находится в файлах Readme.md
                и РАЗБОР.md в корне проекта.
              </p>
            </section>
          )}
          <footer className="page-footer">
            Project Desk <span>Порядок в проектах. Фокус на работе.</span>
          </footer>
        </main>
      </div>
      {form && (
        <RecordForm
          kind={form.kind}
          record={form.record}
          project={selectedProject}
          onClose={() => setForm(null)}
          onSaved={saved}
        />
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, detail, color }) {
  return (
    <div className="stat">
      <div>
        <span className="stat-label">{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
      <span className={`stat-icon ${color}`}>
        <Icon size={23} />
      </span>
    </div>
  );
}
