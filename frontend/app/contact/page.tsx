"use client";

import { useEffect, useMemo, useState } from "react";
import {
  usePageTransition,
  useTransitionPageReady,
} from "@/components/TransitionProvider";
import GridBackground from "@/components/GridBackground";
import HomeButton from "@/components/HomeButton";
import LogoutButton from "@/components/LogoutButton";
import Footer from "@/components/Footer";
import { useSectionTracking } from "@/hooks/useSectionTracking";
import { account } from "../appwrite";
import { getAccountCached } from "@/lib/appwriteCache";
import { submitContactForm } from "@/lib/contactFunction";
import { Loader2, Mail } from "lucide-react";

const MAX_MESSAGE = 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type ContactPrefs = { lastMessage?: string };

function formatRetryLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "later";
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function isRateLimitedByPrefs(prefs: ContactPrefs): {
  limited: boolean;
  retryAfterIso?: string;
} {
  const raw = prefs.lastMessage;
  if (!raw || typeof raw !== "string") return { limited: false };
  const t = new Date(raw).getTime();
  if (Number.isNaN(t)) return { limited: false };
  if (Date.now() - t < ONE_DAY_MS) {
    return { limited: true, retryAfterIso: new Date(t + ONE_DAY_MS).toISOString() };
  }
  return { limited: false };
}

/** Shared shell; `font-sans` matches root layout (Inter). */
const fieldShell =
  "w-full rounded-lg border-2 px-3 py-2.5 text-sm font-sans antialiased transition-all duration-300 outline-none";

/** Name — editable, matches active inputs elsewhere on the site. */
const editableNameFieldClass = `${fieldShell} bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-white/90 hover:border-neutral-600 disabled:opacity-45 disabled:cursor-not-allowed`;

/** Email — account email, read-only, visually greyed out. */
const lockedEmailFieldClass = `${fieldShell} bg-neutral-900 border-neutral-800 text-neutral-500 cursor-default select-text`;

const messageFieldClass = `${fieldShell} bg-neutral-900 border-neutral-800 min-h-[168px] resize-y py-3 leading-relaxed text-neutral-200 focus:border-white/90 hover:border-neutral-600 placeholder:text-neutral-500 disabled:opacity-45 disabled:pointer-events-none`;

export default function ContactPage() {
  const { navigate } = usePageTransition();
  const sectionRef = useSectionTracking<HTMLDivElement>("Contact");

  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [clientRateRetryIso, setClientRateRetryIso] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useTransitionPageReady(ready);

  const clientLimited = clientRateRetryIso !== null;
  const remainingChars = MAX_MESSAGE - message.length;

  const retryHint = useMemo(() => {
    if (!clientRateRetryIso) return null;
    return formatRetryLabel(clientRateRetryIso);
  }, [clientRateRetryIso]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const user = await getAccountCached();
        if (!user.emailVerification) {
          navigate("/authenticate");
          return;
        }
        if (cancelled) return;
        setName(user.name || "");
        setEmail(user.email || "");

        try {
          const prefs = await account.getPrefs<ContactPrefs>();
          const rl = isRateLimitedByPrefs(prefs);
          if (rl.limited && rl.retryAfterIso) {
            setClientRateRetryIso(rl.retryAfterIso);
          }
        } catch {
          /* prefs optional */
        }
      } catch {
        navigate("/login");
        return;
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (clientLimited) {
      return;
    }

    const trimmed = message.trim();
    if (!trimmed) {
      setError("Please enter a message.");
      return;
    }
    if (trimmed.length > MAX_MESSAGE) {
      setError(`Message must be at most ${MAX_MESSAGE} characters.`);
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitContactForm({
        name: name.trim(),
        message: trimmed,
      });
      if (result.ok) {
        setError(null);
        setSuccess(true);
        setMessage("");
        const next = new Date(Date.now() + ONE_DAY_MS).toISOString();
        setClientRateRetryIso(next);
        return;
      }
      if (result.code === "RATE_LIMIT") {
        const iso = result.retryAfter || new Date(Date.now() + ONE_DAY_MS).toISOString();
        setClientRateRetryIso(iso);
        setError(
          `You can send one message per day. Try again after ${formatRetryLabel(iso)}.`
        );
        return;
      }
      if (result.code === "VALIDATION" && result.message) {
        setError(result.message);
        return;
      }
      if (result.code === "UNAUTHORIZED") {
        navigate("/login");
        return;
      }
      setError(result.message || "Something went wrong. Please try again.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready) {
    return (
      <div className="flex flex-col min-h-screen">
        <GridBackground className="flex flex-1 pt-30 pb-20 items-center justify-center">
          <HomeButton />
          <LogoutButton />
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-[3px] border-purple-500/25 border-t-purple-400 rounded-full animate-spin" />
            <p className="text-neutral-400 text-sm animate-pulse">Loading…</p>
          </div>
        </GridBackground>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" ref={sectionRef}>
      <GridBackground className="flex flex-1 flex-col pt-28 pb-16 md:pt-32 md:pb-24 px-5 sm:px-8 lg:px-12">
        <HomeButton />
        <LogoutButton />

        <div className="w-full max-w-lg mx-auto flex flex-col items-center flex-1 font-sans antialiased">

          <h1 className="text-4xl font-semibold text-center text-white">
            Contact us
          </h1>

          <form
            onSubmit={handleSubmit}
            className="mt-10 w-full bg-white/[0.03] backdrop-blur-sm border border-neutral-600/40 rounded-2xl p-8 md:p-10 shadow-2xl shadow-black/40 font-sans antialiased text-left"
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="contact-name"
                  className="text-sm font-medium text-neutral-300"
                >
                  Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={128}
                  disabled={clientLimited || submitting}
                  autoComplete="name"
                  className={editableNameFieldClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="contact-email"
                  className="text-sm font-medium text-neutral-400"
                >
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  readOnly
                  aria-readonly="true"
                  className={lockedEmailFieldClass}
                />
              </div>


              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="contact-message"
                  className="text-sm font-medium text-neutral-300 block"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(ev) => setMessage(ev.target.value)}
                  maxLength={MAX_MESSAGE}
                  rows={7}
                  disabled={clientLimited || submitting}
                  className={messageFieldClass}
                  placeholder="Write your message here…"
                />
                <div className="flex justify-end">
                  <span className="text-xs text-neutral-500 tabular-nums">
                    {remainingChars} / {MAX_MESSAGE}
                  </span>
                </div>
              </div>
            </div>



            {clientLimited && retryHint && (
              <div
                className="mt-6 rounded-xl border border-amber-500/35 bg-amber-500/[0.08] px-4 py-3 text-center text-sm text-amber-100/95 leading-snug"
                role="status"
              >
                Next message available after{" "}
                <span className="font-medium text-amber-50">{retryHint}</span>.
              </div>
            )}

            {error && (
              <div
                className="mt-6 rounded-xl border border-red-500/40 bg-red-500/[0.08] px-4 py-3 text-sm text-red-200/95 text-center leading-snug"
                role="alert"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className="mt-6 rounded-xl border border-emerald-500/35 bg-emerald-500/[0.08] px-4 py-3 text-sm text-emerald-100/95 text-center leading-snug"
                role="status"
              >
                Message sent — thank you for getting in touch.
              </div>
            )}

            <button
              type="submit"
              disabled={clientLimited || submitting}
              className="mt-8 flex w-full items-center justify-center gap-2 bg-white text-black font-medium font-sans antialiased py-3 rounded-sm hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-black/25"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  Sending…
                </>
              ) : (
                "Send message"
              )}
            </button>
          </form>
        </div>
      </GridBackground>
      <Footer />
    </div>
  );
}
