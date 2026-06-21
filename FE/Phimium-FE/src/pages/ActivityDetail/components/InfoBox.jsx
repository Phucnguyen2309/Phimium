export function InfoBox({ icon, title, text }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-blue-50 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
        {icon}
      </div>

      <div>
        <h3 className="text-sm font-black text-slate-950">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-600">{text}</p>
      </div>
    </div>
  )
}