import { UserAvatar } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'

export function ParticipantSlot({ participant, isCurrentUser = false }) {
  const { t } = useLanguage()

  if (!participant) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400">
          <svg
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3M9 14a4 4 0 100-8 4 4 0 000 8zm0 2c-3 0-5 1.5-5 3v1h10v-1c0-1.5-2-3-5-3z"
            />
          </svg>
        </div>

        <p className="mt-3 font-semibold text-slate-400">{t('groupDetail.openSpot')}</p>
        <button
          type="button"
          className="text-sm font-bold text-blue-600 hover:text-blue-700"
        >
          {t('groupDetail.inviteFriend')}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        <UserAvatar
          name={participant.fullName}
          avatarUrl={participant.avatarUrl}
          className={`h-20 w-20 text-xl ${
            isCurrentUser ? 'ring-4 ring-blue-500 ring-offset-4' : ''
          }`}
        />

        {isCurrentUser && (
          <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
        )}
      </div>

      <p className="mt-3 font-black text-slate-950">
        {isCurrentUser ? t('groupDetail.you') : participant.fullName}
      </p>

      <p className="text-sm text-slate-500">
        {isCurrentUser ? t('groupDetail.joinedRecently') : t('groupDetail.participant')}
      </p>
    </div>
  )
}
