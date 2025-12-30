import { useGameLoop } from '../hooks/use-game-loop'
import { DrawerProvider, Drawer } from './ui/drawer'
import { DrawerNav } from './ui/drawer-nav'
import { DrawerContent } from './ui/drawer-content'
import { Header } from './header/header'
import { StatsBar } from './stats/stats-bar'
import { SlotsPanel } from './slots/slots-panel'

export function Game() {
  useGameLoop()

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

        <Drawer>
          <div className="flex h-full">
            <div className="w-48 border-r border-[var(--color-border)] bg-[var(--color-surface)]">
              <DrawerNav />
            </div>
            <div className="flex-1 overflow-hidden">
              <DrawerContent />
            </div>
          </div>
        </Drawer>
      </div>
    </DrawerProvider>
  )
}
