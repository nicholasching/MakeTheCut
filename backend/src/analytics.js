import { Client, Databases, Query } from 'node-appwrite';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const DB_ID = 'MacStats';
const COLL_TRAFFIC = 'traffic';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Return a YYYY-MM-DD string for a Date object (UTC). */
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

/** YYYY-MM for a UTC date. */
function monthKeyFromDate(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/** First calendar day of month (UTC) from YYYY-MM. */
function firstDayOfMonth(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1));
}

/** Last calendar day of month (UTC) from YYYY-MM, as Date at 00:00 UTC. */
function lastDayOfMonthDate(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0));
}

/** Number of days in month (UTC). */
function daysInMonth(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** Appwrite document $id: 2-digit year + underscore + month 1–12 (e.g. 25_2). */
function trafficDocId(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  return `${String(y).slice(-2)}_${m}`;
}

/** Enumerate every YYYY-MM from startDate through endDate (inclusive), UTC calendar months. */
function monthRangeInclusive(startDate, endDate) {
  const keys = [];
  let cur = new Date(
    Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1)
  );
  const end = new Date(
    Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), 1)
  );
  while (cur <= end) {
    keys.push(monthKeyFromDate(cur));
    cur.setUTCMonth(cur.getUTCMonth() + 1);
  }
  return keys;
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
    const raw = row.dimensionValues[0].value;
    const date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
    const views = parseInt(row.metricValues[0].value, 10);
    return { date, views };
  });
}

/**
 * Build { average, total, byDate } for one calendar month from GA daily rows.
 * byDate: comma-separated views for each calendar day 1..N (0 if GA returned no row).
 * average: round(total / daysWithGaRow); daysWithGaRow = days that appear in the GA response.
 */
function buildMonthPayload(monthKey, dailyRows) {
  const n = daysInMonth(monthKey);
  const byDay = new Map();
  for (const { date, views } of dailyRows) {
    if (date.startsWith(monthKey)) byDay.set(date, views);
  }

  const values = [];
  let total = 0;
  let daysWithGaRow = 0;
  const [y, mo] = monthKey.split('-').map(Number);

  for (let day = 1; day <= n; day++) {
    const ds = `${monthKey}-${String(day).padStart(2, '0')}`;
    if (byDay.has(ds)) {
      daysWithGaRow++;
      const v = byDay.get(ds);
      values.push(v);
      total += v;
    } else {
      values.push(0);
    }
  }

  const average =
    daysWithGaRow > 0 ? Math.round(total / daysWithGaRow) : 0;
  const byDate = values.join(',');

  return { average, total, byDate };
}

async function upsertMonthDoc(db, docId, payload, log) {
  const { average, total, byDate } = payload;
  try {
    await db.updateDocument(DB_ID, COLL_TRAFFIC, docId, {
      average,
      total,
      byDate,
    });
  } catch {
    try {
      await db.createDocument(DB_ID, COLL_TRAFFIC, docId, {
        average,
        total,
        byDate,
      });
    } catch (err) {
      log(`Failed to upsert ${docId}: ${err.message}`);
    }
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

/**
 * Appwrite Function handler for the daily GA4 traffic sync.
 *
 * Schedule: 0 12 * * *  (12:00 UTC every day)
 *
 * Environment variables:
 *   GA4_PROPERTY_ID, GOOGLE_SERVICE_ACCOUNT_JSON
 *
 * Collection `traffic`: one document per month, $id = YY_M (e.g. 25_2)
 *   average (Integer) — mean daily views over days GA returned a row this month
 *   total   (Integer) — sum of daily views for the month
 *   byDate  (String)  — comma-separated daily views, calendar order (day 1..last; 0 = no GA row)
 */
export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');

  const db = new Databases(client);

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

  log('Loading existing traffic month documents…');
  const existingDocs = await getAllDocuments(db, COLL_TRAFFIC);
  const existingMonths = new Set(existingDocs.map((d) => d.$id));
  log(`Found ${existingMonths.size} cached months`);

  const yesterday = daysAgo(1);
  const sevenDaysAgo = daysAgo(7);
  const eightDaysAgo = daysAgo(8);
  const maxHistory = daysAgo(365);

  const backfillMonthStart = monthKeyFromDate(maxHistory);
  const backfillMonthEnd = monthKeyFromDate(eightDaysAgo);
  const backfillKeys = monthRangeInclusive(
    firstDayOfMonth(backfillMonthStart),
    lastDayOfMonthDate(backfillMonthEnd)
  ).filter((k) => !existingMonths.has(trafficDocId(k)));

  const refreshKeys = monthRangeInclusive(sevenDaysAgo, yesterday);

  const monthsToFetch = [...new Set([...backfillKeys, ...refreshKeys])];
  log(
    `Months to fetch from GA: ${monthsToFetch.length} (${monthsToFetch.map(trafficDocId).join(', ')})`
  );

  let monthsWritten = 0;

  for (const monthKey of monthsToFetch) {
    const docId = trafficDocId(monthKey);
    const start = toDateString(firstDayOfMonth(monthKey));
    const end = toDateString(lastDayOfMonthDate(monthKey));
    const rows = await fetchGA4Views(gaClient, propertyId, start, end, log);
    const inMonth = rows.filter((r) => r.date.startsWith(monthKey));
    const payload = buildMonthPayload(monthKey, inMonth);
    await upsertMonthDoc(db, docId, payload, log);
    monthsWritten++;
  }

  log(`Done. Upserted ${monthsWritten} month document(s).`);
  return res.json({ ok: true, monthsWritten });
};
