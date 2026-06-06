const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function Home() {
  return (
    <main className="shell">
      <section className="intro">
        <p className="eyebrow">Travel Alpii</p>
        <h1>Alpii project foundation is running.</h1>
        <p>
          Next.js is serving the frontend, and the NestJS API is expected at{" "}
          <code>{apiUrl}</code>.
        </p>
        <a href={`${apiUrl}/health`}>Check API health</a>
      </section>
    </main>
  );
}
