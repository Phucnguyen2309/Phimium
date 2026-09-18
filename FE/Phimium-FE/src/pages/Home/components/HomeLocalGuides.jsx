export function HomeLocalGuides() {
  const guides = [
    {
      id: 1,
      name: "Minh Hoang",
      title: "Culinary Expert",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    },
    {
      id: 2,
      name: "Linh Tran",
      title: "History Professor",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    },
    {
      id: 3,
      name: "Tuan Vu",
      title: "Art Enthusiast",
      avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
    },
    {
      id: 4,
      name: "Mai Nguyen",
      title: "Local Storyteller",
      avatar: "https://i.pravatar.cc/150?u=a04258114e29026702e",
    },
    {
      id: 5,
      name: "Khoa Le",
      title: "Coffee Connoisseur",
      avatar: "https://i.pravatar.cc/150?u=a04258114e29026702f",
    }
  ]

  return (
    <section>
      <h2 className="text-2xl font-bold text-blue-950 mb-8">
        Verified Local Guides
      </h2>

      <div className="flex flex-wrap gap-8 pb-4">
        {guides.map((guide) => (
          <div key={guide.id} className="flex flex-col items-center flex-shrink-0 w-28 group cursor-pointer">
            <div className="h-28 w-28 rounded-full overflow-hidden mb-4 border-4 border-white shadow-lg transition-transform group-hover:scale-105">
              <img src={guide.avatar} alt={guide.name} className="h-full w-full object-cover" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 text-center leading-tight">{guide.name}</h4>
            <p className="text-xs text-slate-500 text-center leading-tight mt-1">{guide.title}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

