import { Link } from 'react-router-dom'

import { Container } from '@/components/common'
import { ROUTES } from '@/routes/paths.js'

export function CtaSection() {
  return (
    <section className="bg-slate-50 py-16">
      <Container>
        <div className="rounded-[32px] bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-14 text-center shadow-[0_24px_70px_rgba(15,23,42,0.18)] sm:px-10">
          <h2 className="text-3xl font-black text-white">
            Sẵn sàng trải nghiệm thêm?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-emerald-50">
            Tham gia cộng đồng PHIMIUM với tư cách thành viên hoặc trở thành
            Buddy để chia sẻ hoạt động với mọi người.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to={ROUTES.register}
              className="rounded-lg bg-orange-400 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-orange-300"
            >
              Trở thành Buddy
            </Link>

            <Link
              to={ROUTES.register}
              className="rounded-lg bg-white px-6 py-3 text-sm font-black text-emerald-700 transition hover:bg-emerald-50"
            >
              Bắt đầu miễn phí
            </Link>
          </div>
        </div>
      </Container>
    </section>
  )
}
