import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[url('/istockphoto-511061090-612x612.jpg')] bg-cover bg-center bg-no-repeat" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,6,23,0.72),rgba(2,6,23,0.82),rgba(2,6,23,0.90))]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6">
        <header className="flex items-center justify-between py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/15">
              <img
                src="/logo.png"
                alt="Sky Developers logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="leading-tight">
              <div className="text-xs font-medium tracking-[0.24em] text-white/70">
                SKYLINE ARCHITECTURE
              </div>
              <div className="text-base font-semibold tracking-tight">
                Learning Portal
              </div>
            </div>
          </div>
        </header>

        <main className="flex flex-1 items-center">
          <div className="max-w-3xl py-12">
            <div className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-xs font-semibold tracking-[0.28em] text-white/80 ring-1 ring-white/15">
              ARCHITECTURE TRAINING PLATFORM
            </div>

            <h1 className="mt-6 text-balance text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              Build Better{" "}
              <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
                Design Teams
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-pretty text-lg text-white/70">
              Train your architecture team on design process, BIM coordination,
              documentation quality, and client-ready presentation workflows.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/dashboard">
                <Button className="h-12 px-6 text-base font-semibold">
                  Enter Academy
                </Button>
              </Link>
              <Link href="/admin">
                <Button
                  variant="outline"
                  className="h-12 border-white/20 bg-white/5 px-6 text-base font-semibold text-white hover:bg-white/10"
                >
                  Studio Admin
                </Button>
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-3 text-sm text-white/80 sm:grid-cols-3">
              <div className="group rounded-xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-300/40 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(56,189,248,0.28)]">
                <div className="text-lg font-semibold text-white">Self-paced</div>
                <p className="mt-1 text-white/65">
                  Complete lessons based on your own schedule.
                </p>
              </div>
              <div className="group rounded-xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-300/40 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(56,189,248,0.28)]">
                <div className="text-lg font-semibold text-white">Track progress</div>
                <p className="mt-1 text-white/65">
                  Follow completion status and upcoming tasks.
                </p>
              </div>
              <div className="group rounded-xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-300/40 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(56,189,248,0.28)]">
                <div className="text-lg font-semibold text-white">Team ready</div>
                <p className="mt-1 text-white/65">
                  Learn real project workflows used by the team.
                </p>
              </div>
            </div>
          </div>
        </main>

        <footer className="py-8 text-xs text-white/45">
          Skyline Architecture Academy
        </footer>
      </div>
    </div>
  );
}

