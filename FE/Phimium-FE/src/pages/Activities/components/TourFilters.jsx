import { Icon } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { formatActivityType } from '@/features/activity/activityMapper.js'

import {
  ANY,
  DATE_OPTIONS,
  DURATION_OPTIONS,
  GROUP_SIZE_OPTIONS,
} from '@/pages/Activities/toursFilter.js'

function SelectField({ label, name, value, onChange, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>
      <span className="relative block">
        <select
          name={name}
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          className={`w-full cursor-pointer appearance-none truncate rounded-xl border bg-white py-2.5 pl-3.5 pr-9 text-sm font-medium outline-none transition hover:border-slate-300 focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 ${
            value === ANY ? 'border-slate-200 text-slate-700' : 'border-blue-900/40 text-blue-950'
          }`}
        >
          {children}
        </select>
        <Icon
          name="chevron-down"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          strokeWidth={2}
        />
      </span>
    </label>
  )
}

export function TourFilters({
  changeFilter,
  clearKeyword,
  filters,
  hasActiveFilters,
  keyword,
  locationOptions,
  resetFilters,
  typeOptions,
}) {
  const { t } = useLanguage()

  return (
    <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-4 shadow-[0_20px_50px_-35px_rgba(22,36,86,0.45)] backdrop-blur sm:p-5">
      <div
        role="radiogroup"
        aria-label={t('activities.filters.typeLabel')}
        className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
      >
        {typeOptions.map((type) => {
          const isActive = filters.type === type

          return (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => changeFilter('type', type)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition duration-300 ${
                isActive
                  ? 'bg-blue-950 text-white shadow-md shadow-blue-950/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-blue-950'
              }`}
            >
              {type === ANY ? t('activities.filters.allTours') : formatActivityType(type)}
              {isActive && <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />}
            </button>
          )
        })}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SelectField
          label={t('activities.filters.groupSize')}
          name="groupSize"
          value={filters.groupSize}
          onChange={changeFilter}
        >
          {GROUP_SIZE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.labelKey)}
            </option>
          ))}
        </SelectField>

        <SelectField
          label={t('activities.filters.date')}
          name="date"
          value={filters.date}
          onChange={changeFilter}
        >
          {DATE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.labelKey)}
            </option>
          ))}
        </SelectField>

        <SelectField
          label={t('activities.filters.duration')}
          name="duration"
          value={filters.duration}
          onChange={changeFilter}
        >
          {DURATION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.labelKey)}
            </option>
          ))}
        </SelectField>

        <SelectField
          label={t('activities.filters.location')}
          name="location"
          value={filters.location}
          onChange={changeFilter}
        >
          <option value={ANY}>{t('activities.filters.locationAny')}</option>
          {locationOptions.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </SelectField>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 text-xs">
          {keyword && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 py-1 pl-3 pr-1 font-semibold text-blue-950">
              {t('activities.filters.keyword', { keyword })}
              <button
                type="button"
                onClick={clearKeyword}
                aria-label={t('activities.filters.clearKeyword')}
                className="flex h-5 w-5 items-center justify-center rounded-full transition hover:bg-yellow-200"
              >
                <Icon name="x-mark" className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={resetFilters}
            className="font-semibold text-slate-500 underline-offset-4 transition hover:text-blue-950 hover:underline"
          >
            {t('activities.filters.reset')}
          </button>
        </div>
      )}
    </div>
  )
}
