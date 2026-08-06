export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="max-w-lg text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Gravity
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-900">
          Admin Portal
        </h1>
        <p className="mt-3 text-zinc-600">
          Next.js scaffolding for the staff admin experience. API integration and
          role-based navigation land in US-08.
        </p>
      </div>
    </main>
  );
}
