import { Container } from '@/components/common'

import heroBackground from '@/asset/background.jpg'

export function HeroSection() {
  return (
    <section className="relative -mt-4 min-h-[620px] overflow-hidden">
      <img
  src={heroBackground}
  alt="Cộng đồng PHIMIUM"
  className="absolute inset-0 h-full w-full object-cover opacity-95"
/>

<div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/35 to-white/5" />

<div className="absolute inset-0 bg-gradient-to-t from-slate-50/80 via-transparent to-transparent" />

      <Container className="relative z-10 flex min-h-[620px] items-center py-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Tìm bạn đồng hành cho mọi trải nghiệm
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-slate-700">
            Khám phá workshop, quán cafe chill, board game và những trải nghiệm
            độc đáo trong thành phố cùng những Buddy cùng vibe với bạn.
          </p>

          <div className="mt-8 flex max-w-2xl flex-col gap-3 rounded-full bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.18)] ring-1 ring-slate-100 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-3 px-4 py-3">
              <span className="text-emerald-600">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
                  />
                </svg>
              </span>

              <input
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Hoạt động, VD: Làm gốm"
              />
            </div>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            <div className="flex flex-1 items-center gap-3 px-4 py-3">
              <span className="text-emerald-600">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 21s7-4.438 7-11a7 7 0 10-14 0c0 6.562 7 11 7 11z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 10a2 2 0 100-4 2 2 0 000 4z"
                  />
                </svg>
              </span>

              <input
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                placeholder="Ở đâu?"
              />
            </div>

            <a
              href="#popular-activities"
              className="rounded-full bg-emerald-600 px-8 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              Khám phá
            </a>
          </div>
        </div>
      </Container>
    </section>
  )
}
