import { MyGroupCard } from './components/MyGroupCard.jsx'
import { useMyGroups } from '../MyGroup/useMyGroup.js'

export default function MyGroupsView() {
  const { groups, loading, error } = useMyGroups()

  const groupList = Array.isArray(groups) ? groups : []

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-black text-slate-950">Groups</h1>
        <p className="mt-2 text-sm text-slate-500">
          Loading groups...
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-[390px] animate-pulse rounded-3xl bg-white shadow-sm"
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-black text-slate-950">Groups</h1>

        <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-600">
          Failed to load groups.
        </div>
      </div>
    )
  }

  if (groupList.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-black text-slate-950">Groups</h1>

        <div className="mt-5 rounded-3xl border border-dashed border-blue-200 bg-blue-50/50 p-8 text-center">
          <h2 className="text-lg font-black text-slate-950">
            You haven't joined any groups yet
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            When you join an activity and get assigned to a group, it will appear here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-950">Groups</h1>
        <p className="mt-2 text-sm text-slate-500">
          List of groups you have joined.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {groupList.map((group, index) => (
          <MyGroupCard
            key={group.id || group.groupId}
            group={group}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}