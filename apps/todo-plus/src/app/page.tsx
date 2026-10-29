import { ThemeToggle } from "@/components/ThemeToggle";
import { TodoApp } from "@/components/TodoApp";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 pt-6 pb-16 sm:px-6 sm:pt-10">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          To Do +
        </h1>
        <ThemeToggle />
      </header>
      <TodoApp />
    </main>
  );
}
