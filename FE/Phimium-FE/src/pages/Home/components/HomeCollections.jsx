import { ForkKnifeIcon, MuseumIcon } from './HomeIcons.jsx'

export function HomeCollections() {
  const collections = [
    { id: 1, name: "Food Stories", icon: <ForkKnifeIcon className="h-5 w-5 text-yellow-600" /> },
    { id: 2, name: "Museum & History", icon: <MuseumIcon className="h-5 w-5 text-yellow-600" /> },
    { id: 3, name: "Nightlife", icon: <ForkKnifeIcon className="h-5 w-5 text-yellow-600" /> },
    { id: 4, name: "Nature Escapes", icon: <MuseumIcon className="h-5 w-5 text-yellow-600" /> },
  ]

  return (
    <section>
      <h2 className="text-2xl font-bold text-blue-950 mb-6">
        Curated Collections
      </h2>

      <div className="flex flex-wrap gap-4 pb-2">
        {collections.map((collection) => (
          <button
            key={collection.id}
            className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-6 py-3 shadow-sm transition-colors hover:bg-slate-50 hover:shadow-md"
          >
            {collection.icon}
            <span className="text-sm font-bold text-slate-800">{collection.name}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

