import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Tasks — A calm todo app" },
      { name: "description", content: "A minimal, elegant todo app to organize your day with clarity." },
    ],
  }),
});

type Todo = { id: string; text: string; done: boolean };

const STORAGE_KEY = "todos.v1";

function Index() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTodos(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos, hydrated]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setTodos((t) => [{ id: crypto.randomUUID(), text, done: false }, ...t]);
    setInput("");
  };

  const toggle = (id: string) =>
    setTodos((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  const remove = (id: string) => setTodos((t) => t.filter((x) => x.id !== id));
  const clearDone = () => setTodos((t) => t.filter((x) => !x.done));

  const remaining = todos.filter((t) => !t.done).length;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl px-6 pt-20 pb-16">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Today</p>
          <h1 className="mt-2 font-serif text-5xl font-medium tracking-tight text-foreground">
            Your tasks
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {remaining === 0 ? "All clear. Enjoy the quiet." : `${remaining} thing${remaining === 1 ? "" : "s"} to do.`}
          </p>
        </header>

        <form onSubmit={add} className="mb-8 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a task…"
            className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 text-primary-foreground transition hover:opacity-90 active:scale-95"
            aria-label="Add task"
          >
            <Plus className="h-4 w-4" />
          </button>
        </form>

        <ul className="space-y-2">
          {todos.map((t) => (
            <li
              key={t.id}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition hover:shadow-[var(--shadow-soft)]"
            >
              <button
                onClick={() => toggle(t.id)}
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition",
                  t.done
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary"
                )}
                aria-label={t.done ? "Mark incomplete" : "Mark complete"}
              >
                {t.done && <Check className="h-3 w-3" strokeWidth={3} />}
              </button>
              <span
                className={cn(
                  "flex-1 text-sm transition",
                  t.done ? "text-muted-foreground line-through" : "text-foreground"
                )}
              >
                {t.text}
              </span>
              <button
                onClick={() => remove(t.id)}
                className="opacity-0 transition group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                aria-label="Delete task"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>

        {todos.length === 0 && hydrated && (
          <div className="mt-12 rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="font-serif text-lg text-foreground">A fresh start.</p>
            <p className="mt-1 text-sm text-muted-foreground">Add your first task above.</p>
          </div>
        )}

        {todos.some((t) => t.done) && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={clearDone}
              className="text-xs uppercase tracking-wider text-muted-foreground transition hover:text-foreground"
            >
              Clear completed
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
