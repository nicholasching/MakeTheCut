import { Client, Databases, ID, Query } from 'node-appwrite';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const DB_ID = 'MacStats';
const COLL_TRAFFIC = 'traffic';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Return a YYYY-MM-DD string for a Date object. */
function toDateString(date) {
  return date.toISOString().slice(0, 10);
}

/** Return a Date for N days before today (UTC midnight). */
function daysAgo(n) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

/** Build an array of YYYY-MM-DD strings from startDate to endDate inclusive. */
function dateRange(start, end) {
  const dates = [];
  const cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    dates.push(toDateString(cur));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return dates;
}

/** Paginate through all documents in a collection and return them. */
async function getAllDocuments(db, collId, queries = []) {
  const docs = [];
  let cursor = null;
  while (true) {
    const q = [...queries, Query.limit(100)];
    if (cursor) q.push(Query.cursorAfter(cursor));
    const res = await db.listDocuments(DB_ID, collId, q);
    docs.push(...res.documents);
    if (res.documents.length < 100) break;
    cursor = res.documents[res.documents.length - 1].$id;
  }
  return docs;
}

/**
 * Query GA4 for pageviews over a date range and return an array of
 * { date: "YYYY-MM-DD", views: number } objects.
 *
 * GA4 returns dates in YYYYMMDD format — we normalise to YYYY-MM-DD.
 */
async function fetchGA4Views(gaClient, propertyId, startDate, endDate, log) {
  log(`Fetching GA4 views from ${startDate} to ${endDate}`);
  const [response] = await gaClient.runReport({
    property: `properties/${propertyId}`,
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'screenPageViews' }],
    dateRanges: [{ startDate, endDate }],
    orderBys: [{ dimension: { dimensionName: 'date' } }],
  });

  if (!response.rows) return [];

  return response.rows.map((row) => {
    const raw = row.dimensionValues[0].value; // "20250410"
    const date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
    const views = parseInt(row.metricValues[0].value, 10);
    return { date, views };
  });
}

/**
 * Upsert a single traffic document.  $id is the date string so upserts are
 * idempotent and duplicate-safe.
 */
async function upsertTraffic(db, date, views, log) {
  try {
    await db.updateDocument(DB_ID, COLL_TRAFFIC, date, { views });
  } catch {
    // Document does not exist yet — create it.
    try {
      await db.createDocument(DB_ID, COLL_TRAFFIC, date, { date, views });
    } catch (err) {
      log(`Failed to upsert ${date}: ${err.message}`);
    }
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

/**
 * Appwrite Function handler for the daily GA4 traffic sync.
 *
 * Schedule: 0 12 * * *  (12:00 UTC every day)
 *
 * Required environment variables (set in Appwrite Console):
 *   GA4_PROPERTY_ID            — numeric GA4 property ID (e.g. "123456789")
 *   GOOGLE_SERVICE_ACCOUNT_JSON — full service-account key JSON as a string
 *
 * Appwrite collection required (create manually in Console):
 *   Database:    MacStats
 *   Collection:  traffic
 *   Fields:      date  (String, size 10, required)
 *                views (Integer, required)
 *   Permissions: Read → Any  |  Write → API Key only
 */
export default async ({ req, res, log, error }) => {
  // ── Init Appwrite client ──────────────────────────────────────────────────
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');

  const db = new Databases(client);

  // ── Init GA4 client ───────────────────────────────────────────────────────
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) {
    error('GA4_PROPERTY_ID is not set');
    return res.json({ ok: false, reason: 'GA4_PROPERTY_ID missing' }, 500);
  }

  let credentials;
  try {
    credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON ?? '');
  } catch {
    error('GOOGLE_SERVICE_ACCOUNT_JSON is missing or invalid JSON');
    return res.json({ ok: false, reason: 'GOOGLE_SERVICE_ACCOUNT_JSON invalid' }, 500);
  }

  const gaClient = new BetaAnalyticsDataClient({ credentials });

  // ── Load existing cached dates ────────────────────────────────────────────
  log('Loading existing traffic documents…');
  const existingDocs = await getAllDocuments(db, COLL_TRAFFIC);
  const existingDates = new Set(existingDocs.map((d) => d.date));
  log(`Found ${existingDates.size} cached dates`);

  // ── Determine what to fetch ───────────────────────────────────────────────
  //
  // Two ranges:
  //   1. Backfill  — dates in [365daysAgo … 8daysAgo] with no cached doc
  //   2. Refresh   — always re-fetch [7daysAgo … yesterday] because GA4
  //                  data for recent days can be revised for up to 48 h
  //
  const yesterday = daysAgo(1);
  const sevenDaysAgo = daysAgo(7);
  const eightDaysAgo = daysAgo(8);
  const maxHistory = daysAgo(365);

  const backfillDates = dateRange(maxHistory, eightDaysAgo).filter(
    (d) => !existingDates.has(d)
  );
  const refreshDates = dateRange(sevenDaysAgo, yesterday); // always re-fetch

  log(`Backfill: ${backfillDates.length} missing dates`);
  log(`Refresh:  ${refreshDates.length} dates (rolling 7-day window)`);

  let upserted = 0;

  // ── Backfill missing historical dates ────────────────────────────────────
  if (backfillDates.length > 0) {
    const startDate = backfillDates[0];
    const endDate = backfillDates[backfillDates.length - 1];
    const rows = await fetchGA4Views(gaClient, propertyId, startDate, endDate, log);
    for (const { date, views } of rows) {
      await upsertTraffic(db, date, views, log);
      upserted++;
    }
  }

  // ── Rolling 7-day refresh ─────────────────────────────────────────────────
  const refreshStart = toDateString(sevenDaysAgo);
  const refreshEnd = toDateString(yesterday);
  const refreshRows = await fetchGA4Views(gaClient, propertyId, refreshStart, refreshEnd, log);
  for (const { date, views } of refreshRows) {
    await upsertTraffic(db, date, views, log);
    upserted++;
  }

  log(`Done. Upserted ${upserted} documents.`);
  return res.json({ ok: true, upserted });
};
