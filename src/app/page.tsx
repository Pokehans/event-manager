import Image from "next/image";
import LoginForm from "@/components/login-form";
import LoginLegalFooter from "@/components/login-legal-footer";

type HomePageProps = {
  searchParams?: Promise<{
    reason?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const reason = params?.reason;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(26,103,123,0.16),transparent_34%),linear-gradient(135deg,#f6f8f7_0%,#eef3f2_100%)] px-5 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col justify-center">
        <div className="grid w-full items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative flex min-h-[540px] overflow-hidden rounded-3xl border border-[rgba(255,255,255,0.7)] bg-[var(--color-primary)] p-8 text-white shadow-xl sm:p-10">
            <div className="absolute right-[-120px] top-[-120px] h-72 w-72 rounded-full bg-white/10" />
            <div className="absolute bottom-[-140px] left-[-100px] h-80 w-80 rounded-full bg-black/10" />

            <div className="relative z-10 flex w-full flex-col justify-between gap-10">
              <div>
                <div className="mb-10 inline-flex rounded-2xl bg-white p-3 shadow-sm">
                  <Image
                    src="/logo.png"
                    alt="Restaurant Musterhof Logo"
                    width={95}
                    height={30}
                    priority
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-xl font-bold text-white">
                    Restaurant Musterhof
                  </p>
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                    Event Manager
                  </h1>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/60">
                    Business Operations Platform
                  </p>
                </div>

                <div className="mt-8 max-w-xl space-y-3">
                  <p className="text-base leading-7 text-white/78">
                    Alles an einem Ort für Eventplanung, Kalenderkoordination und
                    Betriebsorganisation.
                  </p>

                  <p className="text-base font-semibold leading-7 text-white">
                    Planen, koordinieren und verwalten – die zentrale Lösung für Ihr
                    Eventgeschäft.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/55">
                    Systemstatus
                  </p>
                  <p className="mt-2 text-sm font-semibold">Online</p>
                </div>
                
                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/55">
                    Wartung
                  </p>
                  <p className="mt-2 text-sm font-semibold">
                    Donnerstag, 15.06.2026 15.00 - 19.00 Uhr
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/55">
                    Letztes Update
                  </p>
                  <p className="mt-2 text-sm font-semibold">25.04.2026</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/55">
                    Version
                  </p>
                  <p className="mt-2 text-sm font-semibold">V2.0</p>
                </div>
              </div>
            </div>
          </section>

          <section className="flex min-h-[540px]">
            <LoginForm reason={reason} />
          </section>
        </div>

        <LoginLegalFooter />
      </div>
    </main>
  );
}