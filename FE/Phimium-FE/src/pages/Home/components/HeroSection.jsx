import { SearchIcon } from './HomeIcons.jsx'

export function HeroSection() {
  return (
    <section className="relative h-[600px] overflow-hidden bg-slate-900">
      <img
        src="https://images.unsplash.com/photo-1583417319070-4a69db38a482?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80"
        alt="Saigon Skyline"
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-950/40 to-transparent" />

      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-light leading-tight text-white sm:text-5xl lg:text-7xl">
          Discover the<br/>
          <span className="font-semibold">Soul of Saigon</span>
        </h1>

        <p className="mt-6 text-sm leading-relaxed text-slate-200 max-w-xl sm:text-lg">
          Bespoke luxury experiences curated by locals who know the city's heartbeat.
        </p>

        <div className="mt-10 flex w-full max-w-2xl items-center gap-2 rounded-2xl bg-white p-2 shadow-2xl">
          <div className="flex flex-1 items-center gap-3 pl-4">
            <span className="text-slate-400">
              <SearchIcon className="h-6 w-6" />
            </span>
            <input
              className="w-full bg-transparent text-base outline-none placeholder:text-slate-400 py-2"
              placeholder="Search for your next journey..."
            />
          </div>
          <button className="rounded-xl bg-yellow-400 px-8 py-3.5 text-sm font-bold text-yellow-950 shadow-sm transition hover:bg-yellow-300">
            Search
          </button>
        </div>
      </div>
    </section>
  )
}

