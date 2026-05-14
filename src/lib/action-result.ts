export type ActionResult<T = void> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export function actionError(message: string): { ok: false; error: string } {
  return { ok: false, error: message };
}

export function actionOk<T = void>(data?: T): ActionResult<T> {
  return { ok: true, data };
}
