import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Expenses — A simple expense tracker" },
      { name: "description", content: "Track your daily expenses with a calm, minimal interface." },
    ],
  }),
});

type Expense = {
  id: string;
  description: string;
  amount: number;
  category: Category;
  createdAt: number;
};

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Other"] as const;
type Category = (typeof CATEGORIES)[number];

const STORAGE_KEY = "expenses.v1";

const categoryStyles: Record<Category, string> = {
  Food: "bg-[oklch(0.92_0.05_70)] text-[oklch(0.35_0.08_50)]",
  Transport: "bg-[oklch(0.92_0.04_220)] text-[oklch(0.35_0.08_240)]",
  Shopping: "bg-[oklch(0.93_0.05_330)] text-[oklch(0.38_0.1_340)]",
  Bills: "bg-[oklch(0.92_0.04_140)] text-[oklch(0.35_0.08_150)]",
  Other: "bg-muted text-muted-foreground",
};

function Index() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Food");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setExpenses(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses, hydrated]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const desc = description.trim();
    const amt = parseFloat(amount);
    if (!desc || !Number.isFinite(amt) || amt <= 0) return;
    setExpenses((list) => [
      { id: crypto.randomUUID(), description: desc, amount: amt, category, createdAt: Date.now() },
      ...list,
    ]);
    setDescription("");
    setAmount("");
  };

  const remove = (id: string) => setExpenses((list) => list.filter((x) => x.id !== id));

  const total = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);

  const fmt = (n: number) =>
    new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl px-6 pt-20 pb-16">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">This month</p>
          <h1 className="mt-2 font-serif text-5xl font-medium tracking-tight text-foreground">
            Expenses
          </h1>
          <div className="mt-6 flex items-end gap-3">
            <Wallet className="mb-1 h-5 w-5 text-muted-foreground" />
            <span className="font-serif text-4xl text-foreground">{fmt(total)}</span>
            <span className="mb-2 text-sm text-muted-foreground">
              · {expenses.length} {expenses.length === 1 ? "entry" : "entries"}
            </span>
          </div>
        </header>

        <form onSubmit={add} className="mb-8 space-y-2">
          <div className="flex gap-2">
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you spend on?"
              className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-28 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm text-primary-foreground transition hover:opacity-90 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </form>

        <ul className="space-y-2">
          {expenses.map((e) => (
            <li
              key={e.id}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition hover:shadow-[var(--shadow-soft)]"
            >
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium",
                  categoryStyles[e.category],
                )}
              >
                {e.category}
              </span>
              <span className="flex-1 truncate text-sm text-foreground">{e.description}</span>
              <span className="font-serif text-sm tabular-nums text-foreground">
                {fmt(e.amount)}
              </span>
              <button
                onClick={() => remove(e.id)}
                className="opacity-0 transition group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                aria-label="Delete expense"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>

        {expenses.length === 0 && hydrated && (
          <div className="mt-12 rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="font-serif text-lg text-foreground">Nothing tracked yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">Add your first expense above.</p>
          </div>
        )}
      </div>
    </main>
  );
}
