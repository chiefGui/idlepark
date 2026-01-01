import { motion } from 'framer-motion'
import { useGameStore } from '../../store/game-store'
import { Calendar } from '../../utils/calendar'

export function DayProgress() {
  const currentDay = useGameStore((s) => s.currentDay)
  const progress = currentDay % 1

  const radius = 14
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  const calendar = Calendar.fromDay(currentDay)

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-9 h-9">
        <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="3"
          />
          <motion.circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            initial={false}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.1 }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
          {calendar.dayOfMonth}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium leading-tight">
          {Calendar.getMonthShort(currentDay)}
        </span>
        <span className="text-[10px] text-[var(--color-text-muted)] leading-tight">
          {calendar.year}
        </span>
      </div>
    </div>
  )
}
