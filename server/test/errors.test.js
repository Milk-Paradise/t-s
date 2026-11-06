import { test } from "node:test";
import assert from "node:assert/strict";
import { errorHandler } from "../src/middleware/errors.js";

test("оба кода нарушения foreign key возвращают 409 без деталей SQL", () => {
  for (const code of ["23503", "23001"]) {
    let status;
    let body;
    const res = {
      status(value) {
        status = value;
        return this;
      },
      json(value) {
        body = value;
      },
    };
    errorHandler({ code, message: "internal SQL details" }, {}, res, () => {});
    assert.equal(status, 409);
    assert.match(body.message, /Проект/);
    assert.doesNotMatch(body.message, /internal/);
  }
});
