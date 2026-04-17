import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Smile, Meh, Frown, Trash2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Mood — A simple mood tracker" },
      { name: "description", content: "Log your mood with a note and reflect on how you've been." },
    ],
  }),
});

type Mood = "happy" | "neutral" | "sad";

type Entry = {
  id: string;
  mood: Mood;
  note: string;
  createdAt: number;
};

const STORAGE_KEY = "moods.v1";

const moodConfig: Record<Mood, { label: string; Icon: typeof Smile; styles: string }> = {
  happy: {
    label: "Happy",
    Icon: Smile,
    styles: "bg-[oklch(0.93_0.06_90)] text-[oklch(0.38_0.1_70)]",
  },
  neutral: {
    label: "Neutral",
    Icon: Meh,
    styles: "bg-[oklch(0.93_0.02_250)] text-[oklch(0.4_0.04_250)]",
  },
  sad: {
    label: "Sad",
    Icon: Frown,
    styles: "bg-[oklch(0.92_0.04_260)] text-[oklch(0.38_0.09_270)]",
  },
};

function Index() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [mood, setMood] = useState<Mood>("happy");
  const [note, setNote] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries, hydrated]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    setEntries((list) => [
      { id: crypto.randomUUID(), mood, note: note.trim(), createdAt: Date.now() },
      ...list,
    ]);
    setNote("");
  };

  const remove = (id: string) => setEntries((list) => list.filter((x) => x.id !== id));

  const fmt = (ts: number) =>
    new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl px-6 pt-20 pb-16">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Today</p>
          <h1 className="mt-2 font-serif text-5xl font-medium tracking-tight text-foreground">
            How are you?
          </h1>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>
              {entries.length} {entries.length === 1 ? "entry" : "entries"} logged
            </span>
          </div>
        </header>

        <form onSubmit={add} className="mb-8 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(moodConfig) as Mood[]).map((m) => {
              const { label, Icon } = moodConfig[m];
              const active = mood === m;
              return (
                <button
                  type="button"
                  key={m}
                  onClick={() => setMood(m)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border px-4 py-4 text-sm transition",
                    active
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-6 w-6" />
                  {label}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note (optional)"
              className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 text-sm text-primary-foreground transition hover:opacity-90 active:scale-95"
            >
              Log
            </button>
          </div>
        </form>

        <ul className="space-y-2">
          {entries.map((e) => {
            const { Icon, label, styles } = moodConfig[e.mood];
            return (
              <li
                key={e.id}
                className="group flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 transition hover:shadow-[var(--shadow-soft)]"
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                    styles,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-foreground">{label}</span>
                    {hydrated && (
                      <span className="text-xs text-muted-foreground">{fmt(e.createdAt)}</span>
                    )}
                  </div>
                  {e.note && (
                    <p className="mt-0.5 text-sm text-muted-foreground break-words">{e.note}</p>
                  )}
                </div>
                <button
                  onClick={() => remove(e.id)}
                  className="opacity-0 transition group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                  aria-label="Delete entry"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>

        {entries.length === 0 && hydrated && (
          <div className="mt-12 rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="font-serif text-lg text-foreground">No moods logged yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">Pick how you feel and tap Log.</p>
          </div>
        )}
      </div>
    </main>
  );
}
