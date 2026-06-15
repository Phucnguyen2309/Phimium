import { APP_NAME } from '@/constants/app.js'
import { Container } from '@/components/common/Container.jsx'

export function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="border-b border-white/10 bg-zinc-950/90">
        <Container className="flex h-16 items-center justify-between">
          <a href="/" className="text-lg font-semibold tracking-wide">
            {APP_NAME}
          </a>
          <nav className="flex items-center gap-6 text-sm font-medium text-zinc-300">
            <a className="transition hover:text-white" href="/">
              Home
            </a>
            <a className="transition hover:text-white" href="/movies">
              Movies
            </a>
          </nav>
        </Container>
      </header>

      <main>{children}</main>
    </div>
  )
}
