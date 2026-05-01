"use client";

import { account, database } from "@/app/appwrite";
import { Query } from "appwrite";
import {
  COLL_CUTOFFS,
  COLL_MARKS,
  COLL_TRAFFIC,
  COLL_USERS,
  DATABASE_ID,
  cutoffDocId,
  markDocId,
  queriesForCutoffYear,
} from "@/lib/appwriteDb";
import { queryClient } from "@/lib/queryClient";

const SHORT_STALE_MS = 30_000;
const DEFAULT_STALE_MS = 60_000;

export async function getAccountCached() {
  return queryClient.fetchQuery({
    queryKey: ["account", "current"],
    queryFn: async () => account.get(),
    staleTime: SHORT_STALE_MS,
  });
}

export async function getUserDocCached(userId: string) {
  return queryClient.fetchQuery({
    queryKey: ["users", userId],
    queryFn: async () => database.getDocument(DATABASE_ID, COLL_USERS, userId),
    staleTime: SHORT_STALE_MS,
  });
}

export async function listCutoffsForYearCached(year: number) {
  return queryClient.fetchQuery({
    queryKey: ["cutoffs", year, "list"],
    queryFn: async () =>
      database.listDocuments(DATABASE_ID, COLL_CUTOFFS, queriesForCutoffYear(year)),
    staleTime: DEFAULT_STALE_MS,
  });
}

export async function getCutoffTotalCached(year: number) {
  return queryClient.fetchQuery({
    queryKey: ["cutoffs", year, "total"],
    queryFn: async () =>
      database.getDocument(DATABASE_ID, COLL_CUTOFFS, cutoffDocId(year, "total")),
    staleTime: DEFAULT_STALE_MS,
  });
}

export async function getMarksTotalCached(year: number) {
  return queryClient.fetchQuery({
    queryKey: ["marks", year, "total"],
    queryFn: async () => database.getDocument(DATABASE_ID, COLL_MARKS, markDocId(year, "total")),
    staleTime: DEFAULT_STALE_MS,
  });
}

export async function getMarksCourseCached(year: number, course: string) {
  return queryClient.fetchQuery({
    queryKey: ["marks", year, course],
    queryFn: async () => database.getDocument(DATABASE_ID, COLL_MARKS, markDocId(year, course)),
    staleTime: DEFAULT_STALE_MS,
  });
}

export async function listTrafficDocsCached(limit = 120) {
  return queryClient.fetchQuery({
    queryKey: ["traffic", "list", limit],
    queryFn: async () =>
      database.listDocuments(DATABASE_ID, COLL_TRAFFIC, [Query.limit(limit)]),
    staleTime: SHORT_STALE_MS,
  });
}
