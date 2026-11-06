-- Запуск: psql -U postgres -f init-db.sql
-- Скрипт рассчитан на psql и первый запуск. Существующую БД не удаляет.
\set ON_ERROR_STOP on
CREATE DATABASE project_desk;
\connect project_desk

BEGIN;
CREATE TABLE projects (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(120) NOT NULL CHECK (length(trim(name)) > 0),
  budget NUMERIC(11,2) NOT NULL CHECK (budget >= 0),
  start_date DATE NOT NULL,
  team_size INTEGER NOT NULL CHECK (team_size BETWEEN 1 AND 10000)
);
CREATE TABLE tasks (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  title VARCHAR(160) NOT NULL CHECK (length(trim(title)) > 0),
  cost NUMERIC(11,2) NOT NULL CHECK (cost >= 0),
  due_date DATE NOT NULL,
  priority INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 3)
);
CREATE INDEX tasks_project_id_id_idx ON tasks(project_id, id);
INSERT INTO projects(name, budget, start_date, team_size)
SELECT (ARRAY['Личный кабинет', 'Интернет-магазин', 'Мобильное приложение', 'CRM для отдела продаж', 'Сайт компании'])[(n - 1) % 5 + 1] || ' · ' || n,
       100000 + n * 12500, DATE '2026-09-01' + n, 2 + n % 8
FROM generate_series(1, 240) AS n;
INSERT INTO tasks(project_id, title, cost, due_date, priority)
SELECT p.id, (ARRAY['Согласовать требования', 'Сверстать интерфейс', 'Подключить API', 'Проверить сценарии'])[n],
       5000 + n * 2500, p.start_date + n * 7, 1 + n % 3
FROM projects p CROSS JOIN generate_series(1, 4) AS n;
COMMIT;
