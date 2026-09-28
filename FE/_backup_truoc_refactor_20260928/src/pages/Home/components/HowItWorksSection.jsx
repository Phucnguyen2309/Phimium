import { Container } from '@/components/common'

const STEPS = [
  {
    title: 'Chọn hoạt động',
    text: 'Duyệt workshop, quán cafe, board game và các trải nghiệm trong thành phố.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
      />
    ),
  },
  {
    title: 'Tham gia nhóm',
    text: 'Đăng ký hoạt động và được ghép vào nhóm phù hợp cùng các thành viên khác.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m0-4a4 4 0 100-8 4 4 0 000 8zm8 0a4 4 0 100-8 4 4 0 000 8z"
      />
    ),
  },
  {
    title: 'Trải nghiệm',
    text: 'Gặp gỡ Buddy ngoài đời thực và tận hưởng hoạt động một cách an toàn.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M5 13l4 4L19 7"
      />
    ),
  },
]

export function HowItWorksSection() {
  return (
    <section className="bg-emerald-50/70 py-16">
      <Container>
        <h2 className="text-center text-2xl font-black text-slate-950">
          Cách hoạt động
        </h2>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {STEPS.map((item) => (
            <div key={item.title} className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-200">
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  {item.icon}
                </svg>
              </div>

              <h3 className="mt-5 text-lg font-black text-slate-950">
                {item.title}
              </h3>

              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-600">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
