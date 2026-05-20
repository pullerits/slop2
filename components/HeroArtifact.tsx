export function HeroArtifact() {
  return (
    <aside className="clay-orbit">
      <span className="clay-shape clay-hero-one" />
      <span className="clay-shape clay-hero-two" />
      <span className="clay-shape clay-hero-three" />
      <span className="clay-shape clay-hero-four" />
      <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-[#e5e5e5] bg-[#fffaf0]/90 p-4 backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold">Today run</p>
          <span className="rounded-full bg-[#a4d4c5] px-3 py-1 text-xs font-semibold">
            live
          </span>
        </div>
        <div className="grid gap-3">
          <div className="mock-row">
            <span className="mock-line" />
            <span className="mock-chip" />
          </div>
          <div className="mock-row">
            <span className="mock-line w-4/5" />
            <span className="mock-chip bg-[#ffb084]" />
          </div>
          <div className="mock-row">
            <span className="mock-line w-3/5" />
            <span className="mock-chip bg-[#b8a4ed]" />
          </div>
        </div>
      </div>
    </aside>
  );
}
