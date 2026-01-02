import { useGameLoop } from '../hooks/use-game-loop'
import { useFeedEvents } from '../hooks/use-feed-events'
import { DrawerProvider } from './ui/drawer'
import { Header } from './header/header'
import { StatsBar } from './stats/stats-bar'
import { ParkGrid } from './park/park-grid'
import { FeedToast } from './feed/feed-toast'
import { HappeningBanner } from './happening/happening-banner'
import { HappeningToast } from './happening/happening-toast'
import { SeasonalParticles } from './seasonal/seasonal-particles'

export function Game() {
  useGameLoop()
  useFeedEvents()

  return (
    <DrawerProvider>
      <SeasonalParticles />
      <div className="h-full flex flex-col bg-[var(--color-bg)]">
        <Header />
        <HappeningBanner />
        <StatsBar />

        <main className="flex-1 overflow-auto">
          <div className="max-w-lg mx-auto pt-4">
            <ParkGrid />
          </div>
        </main>

        <FeedToast />
        <HappeningToast />
      </div>
    </DrawerProvider>
  )
}
