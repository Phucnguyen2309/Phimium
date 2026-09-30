// Hạt sáng bay lên liên tục (trang trí, vị trí cố định)
const PARTICLES = Array.from({ length: 16 }, (_, index) => ({
  left: `${(index * 37) % 100}%`,
  delay: `${(index * 0.65) % 9}s`,
  duration: `${8 + (index % 5) * 1.5}s`,
  size: index % 3 === 0 ? 'h-1.5 w-1.5' : 'h-1 w-1',
}))

// Đốm sáng lấp lánh (trang trí, vị trí cố định)
const SPARKS = [
  { className: 'left-[12%] top-[22%]', delay: '0s' },
  { className: 'left-[82%] top-[18%]', delay: '0.8s' },
  { className: 'left-[70%] top-[62%]', delay: '1.6s' },
  { className: 'left-[20%] top-[70%]', delay: '2.2s' },
  { className: 'left-[48%] top-[12%]', delay: '1.1s' },
  { className: 'left-[90%] top-[80%]', delay: '2.8s' },
]

/**
 * Lớp hiệu ứng nền cho khối màu navy: vầng sáng xoay, đốm sáng trôi,
 * hạt vàng bay lên và đốm lấp lánh. Đặt bên trong phần tử cha có
 * `relative isolate overflow-hidden`.
 * particles: số hạt bay lên (0 - 16).
 */
export function AmbientBackground({ particles = 14, className = '' }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 -z-10 ${className}`}>
      <div className="absolute left-1/2 top-0 h-[520px] w-[820px] max-w-full -translate-x-1/2">
        <div className="h-full w-full animate-drift rounded-full bg-blue-700/30 blur-[120px]" />
      </div>
      <div className="absolute -right-32 bottom-0 h-80 w-80 animate-drift-reverse rounded-full bg-yellow-400/15 blur-[100px]" />
      <div className="absolute -left-24 top-1/3 h-64 w-64 animate-drift rounded-full bg-sky-400/10 blur-[90px]" />
      <div className="absolute left-1/2 top-1/2 h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2 animate-aurora bg-[conic-gradient(from_0deg,transparent_0deg,rgba(253,199,0,0.08)_60deg,transparent_120deg,rgba(59,130,246,0.14)_200deg,transparent_280deg)] opacity-80" />

      {PARTICLES.slice(0, particles).map((particle) => (
        <span
          key={particle.left + particle.delay}
          style={{
            left: particle.left,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
          className={`absolute bottom-0 animate-rise rounded-full bg-yellow-300/80 shadow-[0_0_10px_2px_rgba(253,199,0,0.5)] ${particle.size}`}
        />
      ))}

      {SPARKS.map((spark) => (
        <span
          key={spark.className}
          style={{ animationDelay: spark.delay }}
          className={`absolute h-1.5 w-1.5 animate-twinkle rounded-full bg-yellow-300 shadow-[0_0_14px_4px_rgba(253,199,0,0.55)] ${spark.className}`}
        />
      ))}
    </div>
  )
}
