import { Client, Users, Messaging, ID } from "node-appwrite";

const MAX_MESSAGE = 1000;
const MAX_NAME = 128;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const LAST_MESSAGE_KEY = "lastMessage";

function getHeader(req, name) {
  const h = req.headers || {};
  const want = name.toLowerCase();
  for (const k of Object.keys(h)) {
    if (k.toLowerCase() === want) return h[k];
  }
  return undefined;
}

function parseJsonBody(req) {
  if (req.bodyJson != null && typeof req.bodyJson === "object") {
    return req.bodyJson;
  }
  const raw = req.bodyText ?? req.bodyRaw ?? "";
  if (!raw || typeof raw !== "string") return {};
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function sendJson(res, body, statusCode) {
  return res.text(JSON.stringify(body), statusCode, {
    "content-type": "application/json; charset=utf-8",
  });
}

/**
 * Messaging recipients: topic (subscribers) or comma-separated email target IDs.
 * Set APPWRITE_CONTACT_TOPIC_ID or APPWRITE_CONTACT_TARGET_IDS on the function.
 */
function getMessagingRoutes(log) {
  const topicId = (process.env.APPWRITE_CONTACT_TOPIC_ID || "").trim();
  const targetsRaw = (process.env.APPWRITE_CONTACT_TARGET_IDS || "").trim();

  if (topicId) {
    return { topics: [topicId] };
  }

  if (targetsRaw) {
    const targets = targetsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (targets.length > 0) {
      return { targets };
    }
  }

  log(
    "Set APPWRITE_CONTACT_TOPIC_ID (topic whose subscribers receive mail) or APPWRITE_CONTACT_TARGET_IDS (comma-separated Messaging email target IDs)."
  );
  return null;
}

export default async ({ req, res, log, error }) => {
  try {
    const method = (req.method || "GET").toUpperCase();
    if (method !== "POST") {
      return sendJson(res, { ok: false, code: "METHOD", message: "Use POST" }, 405);
    }

    const jwt = getHeader(req, "x-appwrite-user-jwt");
    const userIdHeader = getHeader(req, "x-appwrite-user-id");
    if (!jwt || !userIdHeader) {
      return sendJson(
        res,
        { ok: false, code: "UNAUTHORIZED", message: "Authentication required" },
        401
      );
    }

    const body = parseJsonBody(req);
    if (body === null) {
      return sendJson(res, { ok: false, code: "VALIDATION", message: "Invalid JSON body" }, 400);
    }

    const nameIn = typeof body.name === "string" ? body.name.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message) {
      return sendJson(res, { ok: false, code: "VALIDATION", message: "Message is required" }, 400);
    }
    if (message.length > MAX_MESSAGE) {
      return sendJson(
        res,
        {
          ok: false,
          code: "VALIDATION",
          message: `Message must be at most ${MAX_MESSAGE} characters`,
        },
        400
      );
    }
    if (nameIn.length > MAX_NAME) {
      return sendJson(
        res,
        {
          ok: false,
          code: "VALIDATION",
          message: `Name must be at most ${MAX_NAME} characters`,
        },
        400
      );
    }

    const routes = getMessagingRoutes(log);
    if (!routes) {
      return sendJson(
        res,
        { ok: false, code: "SERVER", message: "Server misconfiguration" },
        500
      );
    }

    const serverClient = new Client()
      .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(req.headers["x-appwrite-key"] ?? "");
    const users = new Users(serverClient);
    const messaging = new Messaging(serverClient);

    const user = await users.get({ userId: userIdHeader });

    const prefs = user.prefs && typeof user.prefs === "object" ? user.prefs : {};
    const lastMessage = prefs[LAST_MESSAGE_KEY];
    if (lastMessage) {
      const t = new Date(lastMessage).getTime();
      if (!Number.isNaN(t) && Date.now() - t < ONE_DAY_MS) {
        const retryAfter = new Date(t + ONE_DAY_MS).toISOString();
        return sendJson(res, { ok: false, code: "RATE_LIMIT", retryAfter }, 429);
      }
    }

    const displayName = nameIn || user.name || "Anonymous";

    const emailText = [
      `User ID: ${user.$id}`,
      `Account email: ${user.email}`,
      `Display name: ${displayName}`,
      "",
      "Message:",
      message,
    ].join("\n");

    await messaging.createEmail({
      messageId: ID.unique(),
      subject: `[MakeTheCut Contact] ${displayName}`,
      content: emailText,
      ...routes,
    });

    await users.updatePrefs({
      userId: user.$id,
      prefs: { [LAST_MESSAGE_KEY]: new Date().toISOString() },
    });

    return sendJson(res, { ok: true }, 200);
  } catch (e) {
    const msg = e && e.message ? e.message : String(e);
    log(msg);
    if (typeof error === "function") error(e);
    return sendJson(
      res,
      { ok: false, code: "SERVER", message: "Something went wrong" },
      500
    );
  }
};
