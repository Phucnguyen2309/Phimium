import { useEffect, useState } from 'react'
import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../components/common'
import { AuthContext } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import activityService from '../services/activityService'

const fallbackActivities = [
  {
    id: 'pottery',
    title: 'Artisanal Pottery Workshop',
    description: 'Master the wheel with professional local ceramists.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1492496913980-501348b61469?q=80&w=1200&auto=format&fit=crop',
    locationName: 'Clay Studio District',
    participationFee: 450000,
    tag: 'New Trend',
    rating: '4.9',
    label: '$45/hr',
  },
  {
    id: 'coffee',
    title: 'Urban Specialty Coffee',
    description: 'Taste curated roasts and connect with nearby buddies.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop',
    locationName: 'District 1',
    participationFee: 0,
    tag: 'Verified',
    rating: '4.8',
    label: '32 Buddies Online',
  },
  {
    id: 'rooftop',
    title: 'Rooftop Socials',
    description: 'Evening social events with skyline views.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200&auto=format&fit=crop',
    locationName: 'Skyline Rooftop',
    participationFee: 280000,
    tag: 'Popular',
    rating: '4.7',
    label: 'Sunset Meetup',
  },
  {
    id: 'cowork',
    title: 'Cowork & Connect',
    description: 'A calm workspace for creators and remote workers.',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop',
    locationName: 'Shared Studio',
    participationFee: 120000,
    tag: 'Recommended',
    rating: '4.8',
    label: 'Flexible Pass',
  },
]

const testimonials = [
  {
    name: 'Jessica R.',
    role: 'Computer Science Student',
    quote:
      'Phimium helped me find local study buddies and workshop partners I never would have met. It transformed my social life.',
  },
  {
    name: 'Marcus T.',
    role: 'Marketing Executive',
    quote:
      'The verification process gave me peace of mind. I have joined three amazing hiking groups through Phimium. Professional and safe.',
  },
  {
    name: 'Sarah L.',
    role: 'Freelance Photographer',
    quote:
      "Being a Buddy is so rewarding. I've shared my love for photography with dozens of people and made genuine friends in the process.",
  },
]

const howItWorks = [
  {
    title: 'Create Profile',
    description: 'Define your interests, personality, and preferred activities to find like-minded companions.',
  },
  {
    title: 'Match',
    description: 'Browse verified Buddies or experiences and send a request to connect in person.',
  },
  {
    title: 'Experience',
    description: 'Meet up at a curated venue and enjoy a real-world experience together with safety first.',
  },
]

const whyPhimium = [
  {
    title: 'Verified Companions',
    description: 'Every Buddy undergoes identity verification and safety screening to ensure a secure real-life environment.',
    tone: 'bg-emerald-100 text-emerald-700',
  },
  {
    title: 'Real-Life Focus',
    description: 'We prioritize digital discovery for offline reality. Stop scrolling and start experiencing.',
    tone: 'bg-orange-100 text-orange-700',
  },
  {
    title: 'Interest-Based Matching',
    description: 'Our algorithm matches you based on shared passions, from obscure hobbies to professional networking.',
    tone: 'bg-indigo-100 text-indigo-700',
  },
]

const formatMoney = (value) => {
  const amount = Number(value)
  if (!amount || amount <= 0) {
    return 'Free'
  }
  return `${amount.toLocaleString('vi-VN')} VND`
}

const formatDate = (dateValue) => {
  if (!dateValue) {
    return ''
  }

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

const mapActivity = (activity, index) => ({
  id: activity?.id ?? `fallback-${index}`,
  title: activity?.title ?? fallbackActivities[index % fallbackActivities.length].title,
  description: activity?.description ?? fallbackActivities[index % fallbackActivities.length].description,
  thumbnailUrl: activity?.thumbnailUrl ?? fallbackActivities[index % fallbackActivities.length].thumbnailUrl,
  locationName: activity?.locationName ?? fallbackActivities[index % fallbackActivities.length].locationName,
  participationFee: activity?.participationFee ?? fallbackActivities[index % fallbackActivities.length].participationFee,
  tag: activity?.activityType ?? fallbackActivities[index % fallbackActivities.length].tag,
  rating: fallbackActivities[index % fallbackActivities.length].rating,
  label: activity?.hostBuddyName ?? fallbackActivities[index % fallbackActivities.length].label,
  startTime: activity?.startTime,
})

const HomePage = () => {
  useDocumentTitle('Trang chủ')
  const { user } = useContext(AuthContext)
  const [activities, setActivities] = useState(fallbackActivities)

  useEffect(() => {
    if (!user) {
      return
    }

    const fetchActivities = async () => {
      try {
        const response = await activityService.getAllActivities()
        const activitiesData = response?.data?.data

        if (Array.isArray(activitiesData) && activitiesData.length > 0) {
          setActivities(activitiesData.slice(0, 4).map(mapActivity))
        }
      } catch (error) {
        if (error?.response?.status !== 403) {
          console.error('Lỗi khi lấy danh sách hoạt động:', error)
        }
      }
    }

    fetchActivities()
  }, [user])

  const featuredActivities = activities.length > 0 ? activities : fallbackActivities
  const primaryActivity = featuredActivities[0]
  const secondaryActivity = featuredActivities[1] ?? fallbackActivities[1]
  const smallActivities = featuredActivities.slice(2, 4)
  const logoTile = smallActivities[0] ?? fallbackActivities[2]
  const coworkTile = smallActivities[1] ?? fallbackActivities[3]

  return (
    <Container className="py-4 sm:py-6">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-[#f6f8ff] shadow-[0_25px_80px_rgba(15,23,42,0.18)]">
        <section id="hero" className="relative min-h-[560px] overflow-hidden bg-slate-900">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2070&auto=format&fit=crop"
            alt="Hero background"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-900/35 to-[#f6f8ff]" />
          <div className="relative z-10 flex min-h-[560px] flex-col items-start justify-center px-5 py-12 sm:px-10 lg:px-14">
            <div className="max-w-2xl text-left text-slate-950">
              <h1 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Find Your Perfect Companion for Any Experience
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-6 text-slate-700 sm:text-base">
                Discover curated real-life workshops, cozy cafes, and unique city experiences with a verified Buddy who
                shares your vibe.
              </p>
            </div>

            <div className="mt-8 flex w-full max-w-3xl flex-col gap-4 rounded-full bg-white/95 p-3 shadow-[0_16px_50px_rgba(15,23,42,0.22)] backdrop-blur-sm md:flex-row md:items-center md:gap-0">
              <div className="flex flex-1 items-center gap-3 rounded-full px-4 py-3 md:rounded-none md:border-r md:border-slate-200">
                <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-sm text-slate-400">Activity (e.g. Pottery)</span>
              </div>
              <div className="flex flex-1 items-center gap-3 rounded-full px-4 py-3 md:rounded-none">
                <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-slate-400">Where to?</span>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full bg-blue-700 px-8 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
              >
                Explore
              </Link>
            </div>
          </div>
        </section>

        <section id="featured-activities" className="bg-white px-5 py-14 sm:px-10 lg:px-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">Popular Activities</h2>
              <p className="mt-2 text-sm text-slate-500">Top experiences chosen by the Phimium community this week.</p>
            </div>
            <a href="#featured-activities" className="hidden text-sm font-semibold text-blue-700 sm:inline-flex">
              View all
              <span className="ml-2">→</span>
            </a>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <article className="group relative min-h-[460px] overflow-hidden rounded-2xl bg-slate-900 shadow-lg lg:row-span-2">
              <img
                src={primaryActivity.thumbnailUrl}
                alt={primaryActivity.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/10" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <span className="inline-flex rounded-full bg-orange-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                  {primaryActivity.tag}
                </span>
                <h3 className="mt-3 max-w-sm text-2xl font-bold leading-tight">{primaryActivity.title}</h3>
                <p className="mt-2 max-w-md text-sm text-white/85">{primaryActivity.description}</p>
                <div className="mt-4 flex items-center gap-4 text-sm font-semibold text-white/90">
                  <span>★ {primaryActivity.rating}</span>
                  <span>{primaryActivity.label}</span>
                </div>
              </div>
            </article>

            <article className="group relative min-h-[220px] overflow-hidden rounded-2xl bg-slate-900 shadow-lg lg:col-span-2">
              <img
                src={secondaryActivity.thumbnailUrl}
                alt={secondaryActivity.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white">
                <div>
                  <h3 className="text-xl font-bold">{secondaryActivity.title}</h3>
                  <p className="text-sm text-white/80">{secondaryActivity.label}</p>
                </div>
                <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">Verified</span>
              </div>
            </article>

            <article className="group relative min-h-[220px] overflow-hidden rounded-2xl bg-slate-900 shadow-lg">
              <img
                src={logoTile.thumbnailUrl}
                alt={logoTile.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/5" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <h3 className="text-lg font-bold">{logoTile.title}</h3>
                <p className="text-sm text-white/80">{logoTile.locationName}</p>
              </div>
            </article>

            <article className="group relative min-h-[220px] overflow-hidden rounded-2xl bg-slate-900 shadow-lg">
              <img
                src={coworkTile.thumbnailUrl}
                alt={coworkTile.title}
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <h3 className="text-lg font-bold">{coworkTile.title}</h3>
                <p className="text-sm text-white/80">{coworkTile.locationName}</p>
              </div>
            </article>
          </div>
        </section>

        <section id="how-it-works" className="bg-[#eaf0ff] px-5 py-16 sm:px-10 lg:px-14">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-bold text-slate-950">How It Works</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {howItWorks.map((item, index) => (
                <article key={item.title} className="rounded-2xl bg-white/70 px-5 py-8 shadow-sm backdrop-blur">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/25">
                    <span className="text-lg font-bold">0{index + 1}</span>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="why-phimium" className="bg-[#f6f8ff] px-5 py-16 sm:px-10 lg:px-14">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-950">Why Phimium?</h2>
              <div className="mt-8 space-y-6">
                {whyPhimium.map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.tone}`}>
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 2.21-1.79 4-4 4a4 4 0 110-8c2.21 0 4 1.79 4 4zm0 0v8m0-8a4 4 0 014-4 4 4 0 010 8c-2.21 0-4-1.79-4-4z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                      <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#dff0ff] via-white to-[#eaefff] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.14)]">
              <div className="flex min-h-[360px] items-center justify-center rounded-[24px] bg-white/40 p-8">
                <img
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200&auto=format&fit=crop"
                  alt="Community illustration"
                  className="h-full max-h-[320px] w-full rounded-[24px] object-cover shadow-xl"
                />
              </div>
              <div className="absolute bottom-6 right-6 max-w-[220px] rounded-2xl bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.18)]">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <span className="h-8 w-8 rounded-full border-2 border-white bg-slate-300" />
                    <span className="h-8 w-8 rounded-full border-2 border-white bg-slate-400" />
                    <span className="h-8 w-8 rounded-full border-2 border-white bg-blue-500" />
                  </div>
                  <span className="text-xs font-semibold text-slate-600">Join 50k+ active companions</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="bg-white px-5 py-16 sm:px-10 lg:px-14">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-950">What Our Community Says</h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex text-amber-500">
                  {'★★★★★'.split('').map((star, index) => (
                    <span key={`${item.name}-${index}`}>{star}</span>
                  ))}
                </div>
                <p className="mt-4 text-sm italic leading-6 text-slate-600">“{item.quote}”</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200" />
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-[#f6f8ff] px-5 py-16 sm:px-10 lg:px-14">
          <div className="rounded-[28px] bg-blue-600 px-6 py-14 text-center text-white shadow-[0_20px_60px_rgba(37,99,235,0.35)] sm:px-10">
            <h2 className="text-3xl font-bold sm:text-4xl">Ready to Experience More?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/90 sm:text-base">
              Join the Phimium community as a member or become a Buddy to share your passions and earn.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register"
                className="rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
              >
                Become a Buddy
              </Link>
              <Link
                to="/login"
                className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-slate-100"
              >
                Get Started for Free
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-200 bg-white px-5 py-10 sm:px-10 lg:px-14">
          <div className="flex flex-col gap-10 md:flex-row md:justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-700">Phimium</div>
              <p className="mt-3 max-w-xs text-sm leading-6 text-slate-500">
                © 2024 Phimium. Connecting people through real-world discovery.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-950">Company</h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-500">
                  <li><a href="#why-phimium">About Us</a></li>
                  <li><a href="#hero">Buddy Terms</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-950">Support</h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-500">
                  <li><a href="#testimonials">Help Center</a></li>
                  <li><a href="#why-phimium">Safety Guidelines</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-950">Legal</h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-500">
                  <li><a href="#">Privacy Policy</a></li>
                  <li><a href="/login">Contact</a></li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Container>
  )
}

export default HomePage
