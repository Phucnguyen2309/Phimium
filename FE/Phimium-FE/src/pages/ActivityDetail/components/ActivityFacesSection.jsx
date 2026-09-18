export function ActivityFacesSection() {
  const faces = [
    { id: 1, name: "Mrs. Ha (Pho Expert)", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d" },
    { id: 2, name: "Mr. Minh (Coffee)", avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d" },
    { id: 3, name: "Ms. Lan (Banh Mi)", avatar: "https://i.pravatar.cc/150?u=a04258114e29026302d" },
  ]

  return (
    <section className="mt-8 px-6 sm:px-8">
      <h2 className="text-xl font-black text-slate-950 mb-4">
        The Faces of the Alley
      </h2>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6 sm:-mx-8 sm:px-8">
        {faces.map((face) => (
          <div key={face.id} className="flex-shrink-0 flex items-center gap-3 rounded-full border border-slate-200 bg-white p-2 pr-5 shadow-sm">
            <img 
              src={face.avatar} 
              alt={face.name} 
              className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <span className="text-sm font-bold text-slate-800">{face.name}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
