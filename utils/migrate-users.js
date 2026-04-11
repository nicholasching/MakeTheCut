/**
 * Copies UserData + UserData24 (+ StreamData24 merge) into collection `users`.
 * Run manually after create-appwrite-collections and backup.
 *
 *   cd utils && npm install
 *   APPWRITE_ENDPOINT=... APPWRITE_PROJECT_ID=... APPWRITE_API_KEY=... node migrate-users.js
 */

import { Client, Databases, Permission, Role, Query } from "node-appwrite";
import dotenv from "dotenv";

dotenv.config();

const ENDPOINT =
  process.env.APPWRITE_ENDPOINT || "https://appwrite.makethecut.ca/v1";
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || "makethecut";
const API_KEY = process.env.APPWRITE_API_KEY;

const DATABASE_ID = "MacStats";
const TARGET = "users";
const SRC_CURRENT = "UserData";
const SRC_GRAD = "UserData24";
const SRC_STREAM = "StreamData24";

const ADMIT_CURRENT = 25;
const ADMIT_GRAD = 24;

function userPerms(userId) {
  return [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ];
}

async function getAllDocuments(databases, collectionId, extraQueries = []) {
  const limit = 100;
  let all = [];
  let lastId = null;
  let hasMore = true;
  while (hasMore) {
    const queries = [
      Query.limit(limit),
      Query.orderAsc("$id"),
      ...extraQueries,
    ];
    if (lastId) queries.push(Query.cursorAfter(lastId));
    const res = await databases.listDocuments(DATABASE_ID, collectionId, queries);
    if (res.documents.length > 0) {
      all = all.concat(res.documents);
      lastId = res.documents[res.documents.length - 1].$id;
      hasMore = res.documents.length === limit;
    } else {
      hasMore = false;
    }
  }
  return all;
}

async function main() {
  if (!API_KEY) {
    console.error("Set APPWRITE_API_KEY");
    process.exit(1);
  }
  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);
  const databases = new Databases(client);

  const streamById = new Map();
  try {
    const streamDocs = await getAllDocuments(databases, SRC_STREAM);
    for (const d of streamDocs) {
      streamById.set(d.$id, d);
    }
    console.log(`Loaded ${streamById.size} ${SRC_STREAM} rows`);
  } catch (e) {
    console.warn("Stream collection missing or empty:", e.message);
  }

  const current = await getAllDocuments(databases, SRC_CURRENT);
  console.log(`Migrating ${current.length} ${SRC_CURRENT} -> ${TARGET} (admitYear ${ADMIT_CURRENT})`);
  for (const doc of current) {
    const {
      $id,
      $createdAt,
      $updatedAt,
      $permissions,
      $collectionId,
      $databaseId,
      ...data
    } = doc;
    const payload = {
      ...data,
      admitYear: ADMIT_CURRENT,
      streamIn: "null",
      streamOut: "null",
    };
    try {
      await databases.createDocument(
        DATABASE_ID,
        TARGET,
        $id,
        payload,
        userPerms($id)
      );
      console.log("  ok current", $id);
    } catch (e) {
      if (e.code === 409)
        console.log("  skip exists current", $id);
      else console.error("  fail", $id, e.message);
    }
  }

  const grad = await getAllDocuments(databases, SRC_GRAD);
  console.log(`Migrating ${grad.length} ${SRC_GRAD} -> ${TARGET} (admitYear ${ADMIT_GRAD})`);
  for (const doc of grad) {
    const {
      $id,
      $createdAt,
      $updatedAt,
      $permissions,
      $collectionId,
      $databaseId,
      ...data
    } = doc;
    const s = streamById.get($id);
    const payload = {
      ...data,
      admitYear: ADMIT_GRAD,
      streamIn: s?.streamIn ?? "null",
      streamOut: s?.streamOut ?? "null",
    };
    try {
      await databases.createDocument(
        DATABASE_ID,
        TARGET,
        $id,
        payload,
        userPerms($id)
      );
      console.log("  ok grad", $id);
    } catch (e) {
      if (e.code === 409) console.log("  skip exists grad", $id);
      else console.error("  fail", $id, e.message);
    }
  }

  console.log("migrate-users done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
