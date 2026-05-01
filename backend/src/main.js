import { Client, Databases, Query } from 'node-appwrite';

const DB_ID = 'MacStats';
const COLL_USERS = 'users';
const COLL_MARKS = 'marks';
const COLL_CUTOFFS = 'cutoffs';

/**
 * First cohort year tracked by the system. The loop starts here and processes
 * every year up to the current incoming cohort.
 */
const COHORT_LAUNCH_YEAR = 24;
const SPECTATOR_ADMIT_YEAR = 99;

const STREAM_KEYS = ['chem', 'civ', 'comp', 'elec', 'engphys', 'mat', 'mech', 'tron', 'soft'];

// ── Schedule (mirrors frontend/lib/scheduleConfig.ts — keep in sync) ────────
const SCHEDULE = {
  streamPrefsOpen:   (y) => new Date(2000 + y,       3,  1),
  sem1GradesOpen:    (y) => new Date(2000 + y,      11, 20),
  fullGradesOpen:    (y) => new Date(2000 + y + 1,   3, 20),
  turnover:          (y) => new Date(2000 + y + 1,   4,  1),
  streamResultsOpen: (y) => new Date(2000 + y + 1,   5,  1),
  dashboardArchive:  (y) => new Date(2000 + y + 1,   7,  1),
  streamResultsLock: (y) => new Date(2000 + y + 2,   4,  1),
};

function computeCurrentAdmitYear(now = new Date()) {
  let y = COHORT_LAUNCH_YEAR;
  while (SCHEDULE.turnover(y) <= now) y++;
  return y;
}

// Historical seat proportions for estimated cutoff simulation
const SEAT_COUNTS = {
  chem: 261/4, civ: 374/4, comp: 372/4, elec: 550/4,
  engphys: 217/4, mat: 138/4, mech: 583/4, tron: 291/4, soft: 438/4,
};

function cutoffDocDefaults(overrides = {}) {
  return {
    streamCount: 0,
    freeChoice: 0,
    streamCutoff: 4,
    firstChoice: 0,
    secondChoice: 0,
    thirdChoice: 0,
    reportCutoff: null,
    ...overrides,
  };
}

/**
 * PATCH-style update: only keys in `data` are sent. Never pass full
 * cutoffDocDefaults() here — that would zero out unrelated fields (e.g.
 * estimated cutoffs must not wipe first/second/third choice counts;
 * reported cutoffs must not wipe streamCutoff or choice counts).
 * On missing document, create with defaults merged with `data`.
 */
async function patchCutoffDocument(database, documentId, data) {
  try {
    await database.updateDocument(DB_ID, COLL_CUTOFFS, documentId, data);
  } catch {
    await database.createDocument(DB_ID, COLL_CUTOFFS, documentId, cutoffDocDefaults(data));
  }
}

// ── Workflow determination per cohort year ───────────────────────────────────
// Returns which pipelines to run for a given admitYear at the current moment.
function getWorkflows(admitYear, now = new Date()) {
  const y = admitYear;
  const inStreamPrefsWindow =
    now >= SCHEDULE.streamPrefsOpen(y) && now < SCHEDULE.sem1GradesOpen(y);
  const inGradesWindow =
    now >= SCHEDULE.sem1GradesOpen(y) && now < SCHEDULE.streamResultsOpen(y);
  const inReportedCutoffsWindow =
    now >= SCHEDULE.streamResultsOpen(y) && now < SCHEDULE.streamResultsLock(y);

  return { inStreamPrefsWindow, inGradesWindow, inReportedCutoffsWindow };
}

// ── Main entry point ────────────────────────────────────────────────────────
export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');
  const database = new Databases(client);

  const now = new Date();
  const currentYear = computeCurrentAdmitYear(now);
  // Incoming cohort might have stream prefs open already
  const maxYear = currentYear + 1;
  const results = [];

  try {
    for (let y = COHORT_LAUNCH_YEAR; y <= maxYear; y++) {
      // Spectator accounts are view-only and never participate in data pipelines.
      if (y === SPECTATOR_ADMIT_YEAR) continue;
      const wf = getWorkflows(y, now);
      const anyActive = wf.inStreamPrefsWindow || wf.inGradesWindow || wf.inReportedCutoffsWindow;
      if (!anyActive) continue;

      log(`── Cohort ${y}: prefs=${wf.inStreamPrefsWindow}, grades=${wf.inGradesWindow}, reported=${wf.inReportedCutoffsWindow}`);

      const documents = await getAllDocuments(database, COLL_USERS, [
        Query.equal('admitYear', y),
      ]);
      log(`   Fetched ${documents.length} user documents for admitYear ${y}`);

      if (documents.length === 0) {
        results.push(`${y}: no documents, skipped`);
        continue;
      }

      // ── WORKFLOW 1: Stream preferences only (streamPrefsOpen → sem1GradesOpen)
      if (wf.inStreamPrefsWindow) {
        await runStreamChoiceCounts(database, documents, y, log);
        results.push(`${y}: streamPrefs (choices + estimated cutoffs)`);
      }

      // ── WORKFLOW 2: Grades available (sem1GradesOpen → streamResultsOpen)
      if (wf.inGradesWindow) {
        await runGradeDistributions(database, documents, y, log);
        await runStreamChoiceCounts(database, documents, y, log);
        await runEstimatedCutoffs(database, documents, y, log);
        results.push(`${y}: grades (distributions + choices + estimated cutoffs)`);
      }

      // ── WORKFLOW 3: Reported cutoffs (streamResultsOpen → streamResultsLock)
      // Grades may still be edited until streamResultsLock — keep marks in sync.
      if (wf.inReportedCutoffsWindow) {
        await runGradeDistributions(database, documents, y, log);
        await runReportedCutoffs(database, documents, y, log);
        results.push(`${y}: reportedCutoffs (+ grade distributions)`);
      }
    }

    log(`\nCompleted: ${results.join(' | ')}`);
  } catch (err) {
    error(`Fatal: ${err.message}`);
  }

  return res.json({ ok: true, results });
};

// ═════════════════════════════════════════════════════════════════════════════
//  PIPELINE: Stream choice counts  (was streams.js)
// ═════════════════════════════════════════════════════════════════════════════

async function runStreamChoiceCounts(database, documents, year, log) {
  const choiceCounts = {};
  for (const k of STREAM_KEYS) {
    choiceCounts[k] = { firstChoice: 0, secondChoice: 0, thirdChoice: 0, freeChoice: 0 };
  }
  let totalFreeChoice = 0;

  for (const doc of documents) {
    if (!doc.streams || doc.streams === 'null') continue;
    const prefs = doc.streams.split(',').map(s => s.trim().toLowerCase());
    const isFreeChoice = doc.freechoice === true;
    if (isFreeChoice) {
      totalFreeChoice++;
      const firstPref = prefs[0];
      if (choiceCounts[firstPref]) {
        choiceCounts[firstPref].freeChoice++;
      }
    }
    prefs.forEach((stream, idx) => {
      if (!choiceCounts[stream]) return;
      if (idx === 0) choiceCounts[stream].firstChoice++;
      else if (idx === 1) choiceCounts[stream].secondChoice++;
      else if (idx === 2) choiceCounts[stream].thirdChoice++;
    });
  }

  for (const k of STREAM_KEYS) {
    await patchCutoffDocument(database, `${year}_${k}`, {
      firstChoice: choiceCounts[k].firstChoice,
      secondChoice: choiceCounts[k].secondChoice,
      thirdChoice: choiceCounts[k].thirdChoice,
      freeChoice: choiceCounts[k].freeChoice,
    });
  }

  const validCount = documents.filter(d => d.streams && d.streams !== 'null' && d.streams.trim() !== '').length;
  await patchCutoffDocument(database, `${year}_total`, {
    streamCount: validCount,
    freeChoice: totalFreeChoice,
  });

  log(`   [choiceCounts] updated ${year}_* cutoff docs`);
}

// ═════════════════════════════════════════════════════════════════════════════
//  PIPELINE: Grade distributions  (was main.js calculateDistribution)
// ═════════════════════════════════════════════════════════════════════════════

function calcAvg(dist) {
  const total = dist.reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  return dist.reduce((acc, count, i) => acc + count * (i + 1), 0) / total;
}

async function runGradeDistributions(database, documents, year, log) {
  const COURSES = ['math1za3', 'math1zb3', 'math1zc3', 'phys1d03', 'phys1e03', 'chem1e03', 'eng1p13'];
  const dists = {};
  for (const c of COURSES) dists[c] = Array(12).fill(0);
  const gpaDist = Array(12).fill(0);

  for (const doc of documents) {
    for (const c of COURSES) {
      if (doc[c] > 0) dists[c][doc[c] - 1]++;
    }
    if (doc.gpa > 0) gpaDist[Math.floor(doc.gpa - 1)]++;
  }

  for (const c of COURSES) {
    await upsertDocument(database, COLL_MARKS, `${year}_${c}`, {
      distribution: dists[c].join(','),
      average: calcAvg(dists[c]),
    });
  }
  await upsertDocument(database, COLL_MARKS, `${year}_total`, {
    distribution: gpaDist.join(','),
    average: calcAvg(gpaDist),
  });

  log(`   [gradeDistributions] updated ${year}_* marks docs`);
}

// ═════════════════════════════════════════════════════════════════════════════
//  PIPELINE: Estimated cutoffs  (was main.js calculateCutoffs)
// ═════════════════════════════════════════════════════════════════════════════

async function runEstimatedCutoffs(database, documents, year, log) {
  const sorted = [...documents]
    .filter(d => d.gpa !== 0)
    .sort((a, b) => {
      if (a.freechoice && !b.freechoice) return -1;
      if (!a.freechoice && b.freechoice) return 1;
      return b.gpa - a.gpa;
    });

  const totalSeats = Object.values(SEAT_COUNTS).reduce((a, b) => a + b, 0);
  const actualSeats = {};
  for (const k of STREAM_KEYS) {
    actualSeats[k] = Math.ceil((SEAT_COUNTS[k] / totalSeats) * sorted.length);
  }

  const streamCounts = {};
  const lowestGPAs = {};
  for (const k of STREAM_KEYS) {
    streamCounts[k] = 0;
    lowestGPAs[k] = -1;
  }

  const assigned = new Set();
  const choiceOutcomeCounts = { firstChoice: 0, secondChoice: 0, thirdChoice: 0 };

  // Free-choice students first
  for (const student of sorted) {
    if (!student.freechoice) continue;
    if (!student.streams || student.streams === 'null') continue;
    const first = student.streams.split(',')[0]?.trim().toLowerCase();
    if (first && streamCounts[first] !== undefined) {
      streamCounts[first]++;
      assigned.add(student.$id);
      choiceOutcomeCounts.firstChoice++;
    }
  }

  // Regular students by descending GPA
  for (const student of sorted) {
    if (assigned.has(student.$id) || student.freechoice) continue;
    if (!student.streams || student.streams === 'null') continue;
    const prefs = student.streams.split(',').map(s => s.trim().toLowerCase());
    for (let idx = 0; idx < prefs.length; idx++) {
      const stream = prefs[idx];
      if (streamCounts[stream] !== undefined && streamCounts[stream] < actualSeats[stream]) {
        streamCounts[stream]++;
        assigned.add(student.$id);
        if (lowestGPAs[stream] === -1 || student.gpa < lowestGPAs[stream]) {
          lowestGPAs[stream] = student.gpa;
        }
        if (idx === 0) choiceOutcomeCounts.firstChoice++;
        else if (idx === 1) choiceOutcomeCounts.secondChoice++;
        else if (idx === 2) choiceOutcomeCounts.thirdChoice++;
        break;
      }
    }
  }

  const cutoffGPAs = {};
  for (const k of STREAM_KEYS) {
    if (lowestGPAs[k] !== -1) {
      cutoffGPAs[k] = Math.max(lowestGPAs[k], 4);
    } else if (streamCounts[k] >= actualSeats[k]) {
      cutoffGPAs[k] = 12;
    } else {
      cutoffGPAs[k] = 4;
    }
    if (streamCounts[k] < actualSeats[k]) {
      cutoffGPAs[k] = 4;
    }
  }

  for (const k of STREAM_KEYS) {
    await patchCutoffDocument(database, `${year}_${k}`, {
      streamCount: streamCounts[k],
      streamCutoff: cutoffGPAs[k],
    });
  }

  const nullStreamsCount = documents.filter(d => !d.streams || d.streams === 'null' || d.streams.trim() === '').length;
  await patchCutoffDocument(database, `${year}_total`, {
    streamCount: documents.length - nullStreamsCount,
    firstChoice: choiceOutcomeCounts.firstChoice,
    secondChoice: choiceOutcomeCounts.secondChoice,
    thirdChoice: choiceOutcomeCounts.thirdChoice,
  });

  log(`   [estimatedCutoffs] updated ${year}_* cutoff docs`);
}

// ═════════════════════════════════════════════════════════════════════════════
//  PIPELINE: Reported cutoffs  (was utils/cutoffActual.js)
// ═════════════════════════════════════════════════════════════════════════════

function mapStreamName(name) {
  if (!name || name === 'null') return null;
  const mapping = {
    chemical: 'chem', civil: 'civ', computer: 'comp', electrical: 'elec',
    'engineering physics': 'engphys', 'eng physics': 'engphys',
    materials: 'mat', mechanical: 'mech', mechatronics: 'tron', software: 'soft',
    chem: 'chem', civ: 'civ', comp: 'comp', elec: 'elec',
    engphys: 'engphys', mat: 'mat', mech: 'mech', tron: 'tron', soft: 'soft',
  };
  return mapping[name.toLowerCase().trim()] || null;
}

async function runReportedCutoffs(database, documents, year, log) {
  const streamData = {};
  for (const k of STREAM_KEYS) {
    streamData[k] = { admitted: [], rejected: [] };
  }

  for (const doc of documents) {
    const streamIn = doc.streamIn;
    const streamOut = doc.streamOut;
    if (!streamIn || streamIn === 'null') continue;
    if (doc.freechoice === true) continue;
    const userGPA = parseFloat(doc.gpa);
    if (!userGPA || userGPA === 0) continue;

    const inKey = mapStreamName(streamIn);
    const outKey = streamOut && streamOut !== 'null' ? mapStreamName(streamOut) : null;

    if (inKey && streamData[inKey]) streamData[inKey].admitted.push(userGPA);
    if (outKey && streamData[outKey]) streamData[outKey].rejected.push(userGPA);
  }

  let totalReported = 0;
  for (const doc of documents) {
    if (doc.streamIn && doc.streamIn !== 'null') totalReported++;
  }

  await patchCutoffDocument(database, `${year}_total`, {
    reportCutoff: totalReported,
  });

  for (const k of STREAM_KEYS) {
    const data = streamData[k];
    let admitted = [...data.admitted].sort((a, b) => a - b);
    let rejected = [...data.rejected].sort((a, b) => b - a);

    // Iteratively remove outlier pairs where gap > 0.5
    if (admitted.length > 0 && rejected.length > 0) {
      const maxIter = Math.min(admitted.length, rejected.length) - 1;
      let iter = 0;
      while (admitted.length > 1 && rejected.length > 1 && iter < maxIter) {
        if (Math.abs(admitted[0] - rejected[0]) > 0.5) {
          admitted.shift();
          rejected.shift();
          iter++;
        } else {
          break;
        }
      }
    }

    let cutoff = 0;
    if (admitted.length > 0 && rejected.length > 0) {
      cutoff = (admitted[0] + rejected[0]) / 2;
    } else if (admitted.length > 0) {
      cutoff = admitted[0];
    } else if (rejected.length > 0) {
      cutoff = rejected[0];
    } else {
      continue;
    }

    await patchCutoffDocument(database, `${year}_${k}`, {
      reportCutoff: cutoff,
    });
  }

  log(`   [reportedCutoffs] updated ${year}_* cutoff docs`);
}

// ═════════════════════════════════════════════════════════════════════════════
//  Shared utility: paginated document fetch
// ═════════════════════════════════════════════════════════════════════════════

async function upsertDocument(database, collectionId, documentId, data) {
  try {
    await database.updateDocument(DB_ID, collectionId, documentId, data);
  } catch {
    await database.createDocument(DB_ID, collectionId, documentId, data);
  }
}

async function getAllDocuments(database, collectionId, filterQueries = []) {
  const limit = 100;
  let allDocuments = [];
  let lastId = null;
  let hasMore = true;

  while (hasMore) {
    const queries = [
      Query.limit(limit),
      Query.orderAsc('$id'),
      ...filterQueries,
    ];
    if (lastId) queries.push(Query.cursorAfter(lastId));

    const response = await database.listDocuments(DB_ID, collectionId, queries);
    if (response.documents.length > 0) {
      allDocuments = [...allDocuments, ...response.documents];
      lastId = response.documents[response.documents.length - 1].$id;
      hasMore = response.documents.length === limit;
    } else {
      hasMore = false;
    }
  }

  return allDocuments;
}
