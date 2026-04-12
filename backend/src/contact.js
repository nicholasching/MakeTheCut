import { Client, Users, Messaging, ID, Query } from "node-appwrite";

const MAX_MESSAGE = 1000;
const MAX_NAME = 128;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const LAST_MESSAGE_KEY = "lastMessage";

/** Inbox: Appwrite user with this email (Messaging delivers to their email targets). */
const CONTACT_INBOX_EMAIL = "chingn@mcmaster.ca";

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

    const serverClient = new Client()
      .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
      .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
      .setKey(req.headers["x-appwrite-key"] ?? "");
    const usersService = new Users(serverClient);
    const messaging = new Messaging(serverClient);

    const user = await usersService.get({ userId: userIdHeader });

    const inboxList = await usersService.list({
      queries: [Query.equal("email", CONTACT_INBOX_EMAIL), Query.limit(1)],
    });
    const inboxUser = inboxList.users?.[0];
    if (!inboxUser) {
      log(`No Appwrite user with email ${CONTACT_INBOX_EMAIL}`);
      return sendJson(
        res,
        { ok: false, code: "SERVER", message: "Contact inbox is not configured" },
        500
      );
    }

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
      users: [inboxUser.$id],
    });

    await usersService.updatePrefs({
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
