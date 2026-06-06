const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function Home() {
  return (
    <main className="grid min-h-screen place-items-center bg-white px-6 py-16">
      <section className="w-full max-w-3xl">
        <p className="mb-3 text-sm font-bold uppercase tracking-normal text-primary">Travel Alpii</p>
        <h1 className="text-5xl font-semibold leading-none tracking-normal text-ink sm:text-7xl">
          Alpii project foundation is running.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
          Next.js is serving the frontend, and the NestJS API is expected at{" "}
          <code className="rounded-md bg-slate-100 px-1.5 py-1 text-base text-ink">{apiUrl}</code>.
        </p>
        <a
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark"
          href={`${apiUrl}/health`}
        >
          Check API health
        </a>
      </section>
    </main>
  );
}
