import { ZodError } from "zod";
export function notFound(value) {
  if (!value)
    throw Object.assign(new Error("Запись не найдена"), { status: 404 });
  return value;
}
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error instanceof ZodError)
    return res
      .status(400)
      .json({
        message:
          "Проверьте поля: " +
          error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join("; "),
      });
  if (["23503", "23001"].includes(error.code))
    return res
      .status(409)
      .json({
        message:
          "Проект не существует или содержит задачи. Сначала удалите или перенесите задачи.",
      });
  if (error.type === "entity.parse.failed")
    return res.status(400).json({ message: "Некорректный JSON" });
  if (error.type === "entity.too.large")
    return res.status(413).json({ message: "Слишком большой запрос" });
  if (error.status === 404)
    return res.status(404).json({ message: error.message });
  console.error(error);
  res
    .status(500)
    .json({
      message:
        "Не удалось выполнить запрос. Проверьте подключение сервера к базе данных.",
    });
}
