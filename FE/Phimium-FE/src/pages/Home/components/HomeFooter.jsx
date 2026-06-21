import { Link } from 'react-router-dom'

import { Container } from '@/components/common'
import { APP_NAME } from '@/constants/app.js'
import { ROUTES } from '@/routes/paths.js'

export function HomeFooter() {
  return (
    <footer className="border-t border-emerald-100 bg-white py-10">
      <Container>
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link
              to={ROUTES.home}
              className="text-xl font-black text-emerald-700"
            >
              {APP_NAME}
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
              Connecting people through workshops, cafes, board games, and
              shared real-world experiences.
            </p>

            <p className="mt-6 text-xs font-semibold text-slate-400">
              © 2026 {APP_NAME}. All rights reserved.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-950">Company</h3>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <Link
                to={ROUTES.home}
                className="block transition hover:text-emerald-700"
              >
                About Us
              </Link>

              <Link
                to={ROUTES.activities}
                className="block transition hover:text-emerald-700"
              >
                Activities
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-950">Support</h3>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <a
                href="#popular-activities"
                className="block transition hover:text-emerald-700"
              >
                Help Center
              </a>

              <a
                href="#popular-activities"
                className="block transition hover:text-emerald-700"
              >
                Safety Guidelines
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-950">Legal</h3>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <a href="#" className="block transition hover:text-emerald-700">
                Privacy Policy
              </a>

              <a href="#" className="block transition hover:text-emerald-700">
                Contact
              </a>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}