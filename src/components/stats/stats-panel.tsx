import { Panel } from '../ui/panel'
import { StatDisplay } from './stat-display'
import type { StatId } from '../../engine/game-types'

const DISPLAY_ORDER: StatId[] = [
  'money',
  'guests',
  'appeal',
  'entertainment',
  'food',
  'comfort',
  'cleanliness',
]

export function StatsPanel() {
  return (
    <Panel title="Park Stats">
      <div className="grid gap-3">
        {DISPLAY_ORDER.map((statId) => (
          <StatDisplay key={statId} statId={statId} />
        ))}
      </div>
    </Panel>
  )
}
