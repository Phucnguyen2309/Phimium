import heroImage from '@/assets/hero.png'
import { Container } from '@/components/common/Container.jsx'
import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'

const stackItems = ['React', 'Vite', 'JavaScript', 'Tailwind CSS']

export function HomePage() {
  useDocumentTitle('Home')

  return (
    <section className="py-16 sm:py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-300">
            Frontend starter
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl">
            Cấu trúc React chuẩn cho Phimium
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300">
            Project đã được tách thành app, layouts, pages, components,
            services, hooks, utils và features để dễ mở rộng khi làm phim,
            auth, profile hoặc admin.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {stackItems.map((item) => (
              <span
                className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200"
                key={item}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-8">
          <img className="mx-auto w-44" src={heroImage} alt="" />
          <div className="mt-8 space-y-3 text-sm text-zinc-300">
            <p>
              <span className="font-semibold text-white">Entry:</span>{' '}
              src/main.jsx
            </p>
            <p>
              <span className="font-semibold text-white">App:</span>{' '}
              src/app/App.jsx
            </p>
            <p>
              <span className="font-semibold text-white">Style:</span>{' '}
              src/index.css
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}
