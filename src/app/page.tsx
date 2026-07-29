export const dynamic = "force-dynamic";

export default async function HomePage() {
    return (
        <main className="grid min-h-screen place-items-center px-6 py-12">
            <section className="w-full max-w-2xl rounded-3xl bg-white p-10 shadow-[0_24px_60px_rgba(16,24,40,0.12)]">
                <p className="m-0 text-sm uppercase tracking-[0.08em] text-slate-600">Dynamic NPC Platform</p>
                <h1 className="mt-4 text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.05] text-slate-950">
                    Brainwave x402 – Dynamic NPC Dialogue
                </h1>
                <p className="mt-4 text-base text-slate-700">
                    AI-powered NPC dialogue generation with x402 micro-payment protocol. Integrate immersive, context-aware characters into your game with a single API call.
                </p>
                <div className="mt-8 flex gap-4 flex-wrap">
                    <a
                        href="/login"
                        className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                    >
                        Get Started →
                    </a>
                    <a
                        href="/docs"
                        className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        View Docs
                    </a>
                </div>
            </section>
        </main>
    );
}
