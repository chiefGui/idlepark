import { useGameLoop } from '../hooks/use-game-loop'
import { useFeedEvents } from '../hooks/use-feed-events'
import { DrawerProvider } from './ui/drawer'
import { Header } from './header/header'
import { StatsBar } from './stats/stats-bar'
import { SlotsPanel } from './slots/slots-panel'
import { FeedToast } from './feed/feed-toast'

export function Game() {
  useGameLoop()
  useFeedEvents()

  return (
    <DrawerProvider>
      <div className="h-full flex flex-col bg-[var(--color-bg)]">
        <Header />
        <StatsBar />

        <main className="flex-1 overflow-auto p-4">
          <div className="max-w-lg mx-auto">
            <SlotsPanel />
          </div>
        </main>

        <FeedToast />
      </div>
    </DrawerProvider>
  )
}
