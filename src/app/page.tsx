import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <main className="flex w-full max-w-4xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-8 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg">
            <span className="text-3xl font-bold text-white">N5</span>
          </div>
        </div>

        <h1 className="mb-4 text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
          N5Deal Marketplace
        </h1>

        <p className="mb-8 max-w-2xl text-xl text-slate-600 dark:text-slate-300">
          Premium M&A Marketplace for Businesses and Investment Opportunities
        </p>

        <div className="mb-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/marketplace"
            className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
          >
            Browse Marketplace
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-900 transition-colors hover:bg-slate-100 hover:border-slate-400 hover:text-slate-950 dark:bg-slate-800 dark:text-white dark:border-slate-700"
          >
            Sign In
          </Link>
        </div>

        <div className="mb-12 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm dark:bg-slate-800">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            <span>Next.js 16</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm dark:bg-slate-800">
            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
            <span>TypeScript</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm dark:bg-slate-800">
            <span className="h-2 w-2 rounded-full bg-purple-500"></span>
            <span>Tailwind CSS</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800">
          <h2 className="mb-4 text-2xl font-semibold text-slate-900 dark:text-white">
            M&A Marketplace Platform
          </h2>
          <p className="text-slate-600 dark:text-slate-300">
            Connect buyers and sellers of businesses, real estate, equity stakes, and investment opportunities.
            <br />
            Secure messaging, professional listings, and streamlined acquisition process.
          </p>
        </div>

        <div className="mt-12 text-sm text-slate-500 dark:text-slate-400">
          <p>Built with Next.js App Router • Full-stack TypeScript Application</p>
        </div>
      </main>
    </div>
  );
}
