import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Heart, Repeat2, Share } from 'lucide-react'
import { useGameStore } from '../../store/game-store'
import { Feed } from '../../systems/feed'
import type { FeedEntry, FeedEventType } from '../../engine/game-types'

const EVENT_EMOJI: Record<FeedEventType, string> = {
  building_built: '🏗️',
  building_demolished: '💔',
  milestone_achieved: '🏆',
  perk_purchased: '⚡',
  guest_threshold: '👥',
  guest_departed: '👋',
  satisfaction_high: '😍',
  satisfaction_low: '😕',
  price_complaint: '💸',
  price_praise: '🤑',
  financial_success: '📈',
  financial_warning: '📉',
  ambient: '💭',
}

function FeedEntryCard({ entry, index }: { entry: FeedEntry; index: number }) {
  const avatarUrl = Feed.generateAvatarUrl(entry.avatarSeed)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05 }}
      className="bg-[var(--color-surface)] rounded-xl p-4 space-y-3"
    >
      {/* Header: Avatar, Handle, Time */}
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <img
            src={avatarUrl}
            alt={entry.handle}
            className="w-11 h-11 rounded-full bg-[var(--color-bg)]"
          />
          <span className="absolute -bottom-0.5 -right-0.5 text-sm">
            {EVENT_EMOJI[entry.type]}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-sm truncate">
              @{entry.handle}
            </span>
            <span className="text-[var(--color-text-muted)] text-xs">
              · {Feed.formatTimestamp(entry.timestamp)}
            </span>
          </div>
          <div className="text-xs text-[var(--color-text-muted)]">
            Day {entry.day}
          </div>
        </div>
      </div>

      {/* Message */}
      <p className="text-sm leading-relaxed">{entry.message}</p>

      {/* Actions: Like, Retweet, Reply, Share */}
      <div className="flex items-center justify-between pt-1 text-[var(--color-text-muted)]">
        <button className="flex items-center gap-1.5 text-xs hover:text-[var(--color-accent)] transition-colors group">
          <MessageCircle size={16} className="group-hover:scale-110 transition-transform" />
          <span>{entry.replies}</span>
        </button>
        <button className="flex items-center gap-1.5 text-xs hover:text-green-500 transition-colors group">
          <Repeat2 size={16} className="group-hover:scale-110 transition-transform" />
          <span>{Feed.formatLikes(entry.retweets)}</span>
        </button>
        <button className="flex items-center gap-1.5 text-xs hover:text-red-500 transition-colors group">
          <Heart size={16} className="group-hover:scale-110 transition-transform" />
          <span>{Feed.formatLikes(entry.likes)}</span>
        </button>
        <button className="flex items-center gap-1.5 text-xs hover:text-[var(--color-accent)] transition-colors group">
          <Share size={16} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </motion.div>
  )
}

export function FeedContent() {
  const feedEntries = useGameStore((s) => s.feedEntries)
  const markFeedRead = useGameStore((s) => s.actions.markFeedRead)

  // Mark as read when viewing
  useEffect(() => {
    markFeedRead()
  }, [markFeedRead])

  if (feedEntries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] flex items-center justify-center mb-4">
          <MessageCircle size={28} className="text-[var(--color-text-muted)]" />
        </div>
        <h3 className="font-medium mb-1">No posts yet</h3>
        <p className="text-sm text-[var(--color-text-muted)] max-w-[200px]">
          Build attractions and watch your guests share their experiences!
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {feedEntries.map((entry, index) => (
          <FeedEntryCard key={entry.id} entry={entry} index={index} />
        ))}
      </AnimatePresence>
    </div>
  )
}
