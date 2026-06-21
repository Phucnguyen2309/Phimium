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
              Kết nối mọi người qua workshop, cafe, board game và những trải
              nghiệm thực tế cùng nhau.
            </p>

            <p className="mt-6 text-xs font-semibold text-slate-400">
              © 2026 {APP_NAME}. Bảo lưu mọi quyền.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-950">Công ty</h3>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <Link
                to={ROUTES.home}
                className="block transition hover:text-emerald-700"
              >
                Về chúng tôi
              </Link>

              <Link
                to={ROUTES.activities}
                className="block transition hover:text-emerald-700"
              >
                Hoạt động
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-950">Hỗ trợ</h3>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <a
                href="#popular-activities"
                className="block transition hover:text-emerald-700"
              >
                Trung tâm trợ giúp
              </a>

              <a
                href="#popular-activities"
                className="block transition hover:text-emerald-700"
              >
                Hướng dẫn an toàn
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-950">Pháp lý</h3>

            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <a href="#" className="block transition hover:text-emerald-700">
                Chính sách bảo mật
              </a>

              <a href="#" className="block transition hover:text-emerald-700">
                Liên hệ
              </a>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}
