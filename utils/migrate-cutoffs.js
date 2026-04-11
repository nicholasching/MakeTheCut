/**
 * Copies StatData -> cutoffs with ids `25_*`, StatData24 -> `24_*`.
 * Run manually after backup.
 */

import { Client, Databases, Permission, Role, Query } from "node-appwrite";
import dotenv from "dotenv";

dotenv.config();

const ENDPOINT =
  process.env.APPWRITE_ENDPOINT || "https://appwrite.makethecut.ca/v1";
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || "makethecut";
const API_KEY = process.env.APPWRITE_API_KEY;

const DATABASE_ID = "MacStats";
const TARGET = "cutoffs";

async function getAllDocuments(databases, collectionId) {
  const limit = 100;
  let all = [];
  let lastId = null;
  let hasMore = true;
  while (hasMore) {
    const queries = [Query.limit(limit), Query.orderAsc("$id")];
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

async function copyYear(databases, sourceCollection, yearPrefix) {
  const docs = await getAllDocuments(databases, sourceCollection);
  console.log(`${sourceCollection}: ${docs.length} docs`);
  for (const doc of docs) {
    const {
      $id,
      $createdAt,
      $updatedAt,
      $permissions,
      $collectionId,
      $databaseId,
      ...data
    } = doc;
    const newId = `${yearPrefix}_${$id}`;
    try {
      await databases.createDocument(
        DATABASE_ID,
        TARGET,
        newId,
        data,
        [Permission.read(Role.users())]
      );
      console.log("  ok", newId);
    } catch (e) {
      if (e.code === 409) console.log("  skip", newId);
      else console.error("  fail", newId, e.message);
    }
  }
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

  await copyYear(databases, "StatData", "25");
  await copyYear(databases, "StatData24", "24");
  console.log("migrate-cutoffs done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
