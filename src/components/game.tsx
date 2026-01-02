import { useGameLoop } from '../hooks/use-game-loop'
import { useFeedEvents } from '../hooks/use-feed-events'
import { DrawerProvider } from './ui/drawer'
import { Header } from './header/header'
import { StatsBar } from './stats/stats-bar'
import { ParkGrid } from './park/park-grid'
import { FeedToast } from './feed/feed-toast'
import { HappeningBanner } from './happening/happening-banner'
import { HappeningToast } from './happening/happening-toast'

export function Game() {
  useGameLoop()
  useFeedEvents()

  return (
    <DrawerProvider>
      <div className="h-full flex flex-col bg-[var(--color-bg)]">
        <Header />
        <HappeningBanner />
        <StatsBar />

        <main className="flex-1 overflow-auto pt-2">
          <ParkGrid />
        </main>

        <FeedToast />
        <HappeningToast />
      </div>
    </DrawerProvider>
  )
}
