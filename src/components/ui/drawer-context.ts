import { createContext } from 'react'
import type { DrawerStore } from './primitives'

export type DrawerScreen = 'menu' | 'milestones' | 'perks' | 'finances' | 'guests_overview' | 'park' | 'timeline' | 'feed' | 'services' | 'service_bank' | 'service_fast_pass' | 'service_marketing' | 'guests' | 'cleanliness'

export type DrawerContextValue = {
  store: DrawerStore
  screen: DrawerScreen
  setScreen: (screen: DrawerScreen) => void
  navigateTo: (screen: DrawerScreen) => void
}

export const DrawerContext = createContext<DrawerContextValue | null>(null)
