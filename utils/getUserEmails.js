/**
 * Usage:
 *   $env:APPWRITE_API_KEY="your_api_key_here"
 *   $env:APPWRITE_ENDPOINT="https://nyc.cloud.appwrite.io/v1"
 *   $env:APPWRITE_PROJECT_ID="makethecut"
 *
 *   node utils/getUserEmails.js                  # all intake years
 *   node utils/getUserEmails.js --year 25        # single intake year
 *   node utils/getUserEmails.js -y 24 --year 25  # multiple intake years
 *   node utils/getUserEmails.js --years=24,25    # comma-separated years
 */
import { Client, Databases, Users, Query } from "node-appwrite";
import { writeFile } from "fs/promises";
import { join } from "path";

const ENDPOINT = process.env.APPWRITE_ENDPOINT || "https://nyc.cloud.appwrite.io/v1";
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID || "makethecut";
const API_KEY = process.env.APPWRITE_API_KEY;

if (!API_KEY) {
  console.error("Missing APPWRITE_API_KEY environment variable.");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);
const users = new Users(client);

const DATABASE_ID = "MacStats";
const USERS_COLLECTION = "users";

function parseYearsFromFlags(argv) {
  const years = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--year" || arg === "-y" || arg === "--intake-year") {
      const raw = argv[i + 1];
      if (!raw) {
        throw new Error(`Missing value for ${arg}. Example: --year 25`);
      }
      const year = Number(raw);
      if (!Number.isInteger(year) || year < 0 || year > 99) {
        throw new Error(`Invalid intake year "${raw}". Use 2-digit value, e.g. 24 or 25.`);
      }
      years.push(year);
      i++;
      continue;
    }

    if (arg.startsWith("--years=")) {
      const values = arg.replace("--years=", "").split(",");
      for (const value of values) {
        const year = Number(value.trim());
        if (!Number.isInteger(year) || year < 0 || year > 99) {
          throw new Error(`Invalid intake year "${value}" in --years list.`);
        }
        years.push(year);
      }
    }
  }
  return [...new Set(years)];
}

async function getUserEmails(admitYears = []) {
  try {
    const yearFilter = admitYears.length > 0 ? [...new Set(admitYears)] : [];
    const yearsText = yearFilter.length ? yearFilter.join(", ") : "all years";
    console.log(`Starting email fetch from unified users collection for: ${yearsText}`);

    const docs = await getAllUserDocuments(yearFilter);
    console.log(`Found ${docs.length} user docs in "${USERS_COLLECTION}"`);

    if (docs.length === 0) {
      return [];
    }

    const userIds = [...new Set(docs.map((doc) => doc.$id))];
    console.log(`Resolving emails for ${userIds.length} user accounts`);

    const allUsers = await getAllUsers();
    const emailByUserId = new Map(allUsers.map((user) => [user.$id, user.email]));

    const emails = [];
    let missingUsers = 0;

    for (const userId of userIds) {
      const email = emailByUserId.get(userId);
      if (email) {
        emails.push(email);
      } else {
        missingUsers++;
        console.warn(`User account not found for document id: ${userId}`);
      }
    }

    console.log(`Found emails: ${emails.length}`);
    if (missingUsers > 0) {
      console.log(`Missing account records: ${missingUsers}`);
    }

    return emails;
  } catch (error) {
    console.error("Error during email fetch:", error.message);
    throw error;
  }
}

async function getAllUserDocuments(admitYears = []) {
  const limit = 100;
  const allDocuments = [];
  let lastId = null;
  let hasMore = true;

  while (hasMore) {
    const queries = [Query.limit(limit), Query.orderAsc("$id")];
    if (lastId) {
      queries.push(Query.cursorAfter(lastId));
    }

    if (admitYears.length > 0) {
      queries.push(Query.equal("admitYear", admitYears));
    }

    const response = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION, queries);

    if (response.documents.length > 0) {
      allDocuments.push(...response.documents);
      lastId = response.documents[response.documents.length - 1].$id;
      hasMore = response.documents.length === limit;
    } else {
      hasMore = false;
    }
  }

  return allDocuments;
}

async function getAllUsers() {
  const limit = 100;
  const allUsers = [];
  let lastId = null;
  let hasMore = true;

  while (hasMore) {
    const queries = [Query.limit(limit), Query.orderAsc("$id")];
    if (lastId) {
      queries.push(Query.cursorAfter(lastId));
    }

    const response = await users.list(queries);
    if (response.users.length > 0) {
      allUsers.push(...response.users);
      lastId = response.users[response.users.length - 1].$id;
      hasMore = response.users.length === limit;
    } else {
      hasMore = false;
    }
  }

  return allUsers;
}

async function exportEmailsToCSV(emails, filename = "user-emails.csv") {
  const csvContent = emails.join("\n");
  const filePath = join(process.cwd(), filename);
  await writeFile(filePath, csvContent, "utf-8");
  console.log(`Exported ${emails.length} emails to: ${filePath}`);
  return filePath;
}

const parsedYears = parseYearsFromFlags(process.argv.slice(2));

getUserEmails(parsedYears)
  .then(async (emails) => {
    console.log("\nUser Emails:");
    console.log(emails);
    console.log(`\nTotal: ${emails.length} emails`);
    if (emails.length > 0) {
      const suffix = parsedYears.length > 0 ? `-${parsedYears.join("-")}` : "";
      await exportEmailsToCSV(emails, `user-emails${suffix}.csv`);
    } else {
      console.log("No emails to export.");
    }
  })
  .catch((error) => {
    console.error("Error:", error.message);
    process.exit(1);
  });

export default getUserEmails;
