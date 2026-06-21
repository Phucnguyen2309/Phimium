import { Container } from '@/components/common'

const TESTIMONIALS = [
  {
    name: 'Jessica R.',
    role: 'University Student',
    text: 'PHIMIUM helped me find people to join workshops with. It feels easier than going alone.',
  },
  {
    name: 'Marcus T.',
    role: 'Office Worker',
    text: 'I discovered cozy cafes and board game groups through PHIMIUM. The experience is simple and fun.',
  },
  {
    name: 'Sarah L.',
    role: 'Creative Learner',
    text: 'The activities feel friendly and real. I like that everything focuses on offline experiences.',
  },
]

export function TestimonialsSection() {
  return (
    <section className="bg-emerald-50/70 py-16">
      <Container>
        <h2 className="text-center text-2xl font-black text-slate-950">
          What Our Community Says
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <div
              key={item.name}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="text-orange-400">★★★★★</div>

              <p className="mt-4 text-sm italic leading-6 text-slate-600">
                “{item.text}”
              </p>

              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-700">
                  {item.name[0]}
                </div>

                <div>
                  <p className="text-sm font-black text-slate-950">
                    {item.name}
                  </p>

                  <p className="text-xs text-slate-500">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}