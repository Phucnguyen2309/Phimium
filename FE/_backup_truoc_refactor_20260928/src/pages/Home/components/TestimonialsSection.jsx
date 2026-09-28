import { Container } from '@/components/common'

const TESTIMONIALS = [
  {
    name: 'Lan N.',
    role: 'Sinh viên',
    text: 'PHIMIUM giúp mình tìm được người cùng tham gia workshop. Đi một mình không còn ngại nữa.',
  },
  {
    name: 'Minh T.',
    role: 'Nhân viên văn phòng',
    text: 'Mình khám phá được mấy quán cafe chill và nhóm board game qua PHIMIUM. Trải nghiệm đơn giản mà vui.',
  },
  {
    name: 'Hà L.',
    role: 'Người yêu sáng tạo',
    text: 'Các hoạt động cảm giác thân thiện và thật. Mình thích vì mọi thứ đều tập trung vào trải nghiệm offline.',
  },
]

export function TestimonialsSection() {
  return (
    <section className="bg-emerald-50/70 py-16">
      <Container>
        <h2 className="text-center text-2xl font-black text-slate-950">
          Cộng đồng nói gì?
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
