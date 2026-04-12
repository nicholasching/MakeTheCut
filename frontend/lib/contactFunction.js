import { functions, ExecutionMethod } from "../app/appwrite";

/** @typedef {{ ok: true } | { ok: false, code: string, message?: string, retryAfter?: string }} ContactResponse */

const CONTACT_FUNCTION_ID = "contact";

const KNOWN_CODES = new Set([
  "RATE_LIMIT",
  "VALIDATION",
  "UNAUTHORIZED",
  "SERVER",
  "METHOD",
]);

/**
 * @param {{ name: string, message: string }} input
 * @returns {Promise<ContactResponse>}
 */
export async function submitContactForm(input) {
  const body = JSON.stringify({
    name: input.name,
    message: input.message,
  });

  const execution = await functions.createExecution(
    CONTACT_FUNCTION_ID,
    body,
    false,
    "/",
    ExecutionMethod.POST,
    {}
  );

  let parsed = {};
  try {
    if (execution.responseBody) {
      parsed = JSON.parse(execution.responseBody);
    }
  } catch {
    /* ignore */
  }

  const status = execution.responseStatusCode;
  if (parsed && typeof parsed.ok === "boolean") {
    if (parsed.ok === true && status >= 200 && status < 300) {
      return { ok: true };
    }
    if (parsed.ok === false) {
      const code = parsed.code;
      return {
        ok: false,
        code: KNOWN_CODES.has(code) ? code : "UNKNOWN",
        message: typeof parsed.message === "string" ? parsed.message : undefined,
        retryAfter:
          typeof parsed.retryAfter === "string" ? parsed.retryAfter : undefined,
      };
    }
  }

  if (status === 429) {
    return {
      ok: false,
      code: "RATE_LIMIT",
      retryAfter:
        typeof parsed.retryAfter === "string" ? parsed.retryAfter : undefined,
    };
  }
  if (status === 401) {
    return { ok: false, code: "UNAUTHORIZED", message: "Authentication required" };
  }

  if (execution.status === "failed" && execution.errors) {
    return { ok: false, code: "SERVER", message: execution.errors.slice(0, 200) };
  }

  return {
    ok: false,
    code: "UNKNOWN",
    message: "Unexpected response from server",
  };
}
