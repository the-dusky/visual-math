import Link from "next/link";

const lessons = [
  {
    title: "Equations",
    desc: "Solve for what's hiding in the box",
    href: "/equations",
    icon: "📦",
    ready: true,
  },
  {
    title: "Inequalities",
    desc: "Find the range on the number line",
    href: "/inequalities",
    icon: "📐",
    ready: true,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-surface text-text font-sans p-5 sm:p-6 flex flex-col items-center">
      <div className="max-w-lg w-full mt-12 sm:mt-20">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-accent text-center mb-2">
          Mekhi&apos;s Math Lab
        </h1>
        <p className="text-text-muted text-center text-sm mb-10">
          Pick a lesson to get started
        </p>

        <div className="grid gap-4">
          {lessons.map((l) =>
            l.ready ? (
              <Link
                key={l.title}
                href={l.href}
                className="group flex items-center gap-4 p-5 rounded-xl bg-surface-raised border border-border hover:border-accent-dim transition-colors no-underline"
              >
                <span className="text-3xl">{l.icon}</span>
                <div>
                  <h2 className="text-lg font-bold text-text group-hover:text-accent transition-colors">
                    {l.title}
                  </h2>
                  <p className="text-sm text-text-muted m-0">{l.desc}</p>
                </div>
              </Link>
            ) : (
              <div
                key={l.title}
                className="flex items-center gap-4 p-5 rounded-xl bg-surface-raised border border-border opacity-40 cursor-not-allowed"
              >
                <span className="text-3xl">{l.icon}</span>
                <div>
                  <h2 className="text-lg font-bold text-text">
                    {l.title}
                    <span className="text-xs font-normal text-text-muted ml-2">Coming soon</span>
                  </h2>
                  <p className="text-sm text-text-muted m-0">{l.desc}</p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
