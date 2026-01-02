import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Heart, Repeat2, Share, Star, Clock } from 'lucide-react'
import { useGameStore } from '../../store/game-store'
import { Feed } from '../../systems/feed'
import { Building } from '../../systems/building'
import { BuildingIcon } from '../../buildings'
import { Format } from '../../utils/format'
import type { FeedEntry, FeedEventType, WishState } from '../../engine/game-types'

const EVENT_EMOJI: Record<FeedEventType, string> = {
  building_built: '🏗️',
  building_demolished: '💔',
  milestone_achieved: '🏆',
  perk_purchased: '⚡',
  guest_threshold: '👥',
  guest_departed: '😤',           // Unhappy guests leaving
  guest_departed_natural: '👋',  // Happy guests going home
  appeal_high: '😍',
  appeal_low: '😕',
  price_complaint: '💸',
  price_praise: '🤑',
  financial_success: '📈',
  financial_warning: '📉',
  ambient: '💭',
  happening_started: '🎪',
  happening_ended: '🎬',
  capacity_reached: '🚫',
  capacity_warning: '⚠️',
  wish: '🌟',
  wish_fulfilled: '✨',
}

type Tab = 'posts' | 'wishes'

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
          <span>{Format.number(entry.retweets)}</span>
        </button>
        <button className="flex items-center gap-1.5 text-xs hover:text-red-500 transition-colors group">
          <Heart size={16} className="group-hover:scale-110 transition-transform" />
          <span>{Format.number(entry.likes)}</span>
        </button>
        <button className="flex items-center gap-1.5 text-xs hover:text-[var(--color-accent)] transition-colors group">
          <Share size={16} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </motion.div>
  )
}

function WishCard({ wish, index, currentDay }: { wish: WishState; index: number; currentDay: number }) {
  const building = Building.getById(wish.buildingId)
  if (!building) return null

  const daysLeft = Math.max(0, Math.ceil(wish.expiresDay - currentDay))
  const progress = daysLeft / 10 // 10 is WISH_DURATION_DAYS

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05 }}
      className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-accent)]/30"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-[var(--color-accent)]/20 flex items-center justify-center">
          <BuildingIcon buildingId={building.id} size={32} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{building.name}</span>
            <span className="text-lg">🌟</span>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            Guests are wishing for this!
          </p>
        </div>
      </div>

      {/* Time remaining */}
      <div className="mt-3 flex items-center gap-2 text-sm">
        <Clock size={14} className="text-[var(--color-text-muted)]" />
        <span className="text-[var(--color-text-muted)]">
          {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1.5 rounded-full bg-[var(--color-bg)] overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-[var(--color-accent)]"
          initial={{ width: '100%' }}
          animate={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Reward hint */}
      <div className="mt-3 text-xs text-[var(--color-accent)] flex items-center gap-1">
        <Star size={12} />
        <span>Build to earn a temporary boost!</span>
      </div>
    </motion.div>
  )
}

function PostsTab() {
  const feedEntries = useGameStore((s) => s.feedEntries)
  const markFeedRead = useGameStore((s) => s.actions.markFeedRead)

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

function WishesTab() {
  const wishes = useGameStore((s) => s.wishes)
  const currentDay = useGameStore((s) => s.currentDay)
  const wishBoost = useGameStore((s) => s.wishBoost)

  // Filter active wishes
  const activeWishes = wishes.filter((w) => w.expiresDay > currentDay)

  return (
    <div className="space-y-4">
      {/* Active boost indicator */}
      {wishBoost && wishBoost.expiresDay > currentDay && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 rounded-xl bg-[var(--color-positive)]/10 border border-[var(--color-positive)]/30"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <div className="flex-1">
              <div className="text-sm font-medium text-[var(--color-positive)]">
                Wish Boost Active!
              </div>
              <div className="text-xs text-[var(--color-text-muted)]">
                +{Math.round((wishBoost.multiplier - 1) * 100)}% {wishBoost.type} · {Math.ceil(wishBoost.expiresDay - currentDay)} days left
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeWishes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-[var(--color-surface)] flex items-center justify-center mb-4">
            <Star size={28} className="text-[var(--color-text-muted)]" />
          </div>
          <h3 className="font-medium mb-1">No active wishes</h3>
          <p className="text-sm text-[var(--color-text-muted)] max-w-[200px]">
            Keep growing your park and guests will start making wishes!
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          {activeWishes.map((wish, index) => (
            <WishCard key={wish.feedEntryId} wish={wish} index={index} currentDay={currentDay} />
          ))}
        </AnimatePresence>
      )}
    </div>
  )
}

export function FeedContent() {
  const [tab, setTab] = useState<Tab>('posts')
  const wishes = useGameStore((s) => s.wishes)
  const currentDay = useGameStore((s) => s.currentDay)

  const activeWishCount = wishes.filter((w) => w.expiresDay > currentDay).length

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl bg-[var(--color-surface)]">
        <button
          onClick={() => setTab('posts')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            tab === 'posts'
              ? 'bg-[var(--color-bg)] text-[var(--color-text)]'
              : 'text-[var(--color-text-muted)]'
          }`}
        >
          Posts
        </button>
        <button
          onClick={() => setTab('wishes')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
            tab === 'wishes'
              ? 'bg-[var(--color-bg)] text-[var(--color-text)]'
              : 'text-[var(--color-text-muted)]'
          }`}
        >
          Wishes
          {activeWishCount > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-accent)] text-white text-[10px] font-bold flex items-center justify-center">
              {activeWishCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {tab === 'posts' ? (
          <motion.div
            key="posts"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            <PostsTab />
          </motion.div>
        ) : (
          <motion.div
            key="wishes"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            <WishesTab />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
