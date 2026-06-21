import { Container } from '@/components/common'
import whyPhimiumImage from '@/asset/items.jpg'

const FEATURES = [
  {
    title: 'Hoạt động thân thiện',
    text: 'PHIMIUM tập trung vào workshop, cafe, board game và các trải nghiệm offline nhẹ nhàng.',
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    title: 'Tham gia theo nhóm',
    text: 'Bạn có thể tham gia hoạt động và được kết nối qua nhóm thay vì đi một mình.',
    color: 'bg-orange-100 text-orange-700',
  },
  {
    title: 'Khám phá theo sở thích',
    text: 'Hoạt động được sắp xếp theo sở thích, giúp bạn dễ tìm trải nghiệm phù hợp.',
    color: 'bg-blue-100 text-blue-700',
  },
]

export function WhyPhimiumSection() {
  return (
    <section className="bg-slate-50 py-16">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-4xl font-black text-slate-950">
              Vì sao chọn Phimium?
            </h2>

            <div className="mt-8 space-y-6">
              {FEATURES.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.color}`}
                  >
                    ✦
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-950">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

           <div className="relative overflow-hidden rounded-[32px] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.14)] ring-1 ring-emerald-100">
            <img
              src={whyPhimiumImage}
              alt="Minh họa cộng đồng PHIMIUM"
              className="h-[360px] w-full rounded-[24px] object-contain"
            />

            <div className="absolute bottom-6 right-6 rounded-2xl bg-white px-4 py-3 shadow-xl">
              <p className="text-xs font-bold text-slate-400">
                Phong cách PHIMIUM
              </p>

              <p className="text-lg font-black text-emerald-700">
                Vui ngoài đời thật
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
